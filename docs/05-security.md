# Seguridad

Seguridad en microfrontends con import maps: CSP, aislamiento, validación y defensa en profundidad.

## Realidad: Composition en mismo runtime = sin aislamiento real

Los MFEs cargados via `import()` (nuestro caso) comparten el **mismo JavaScript realm**: mismo `window`, mismo DOM, mismo CSP, mismos cookies y storage.

> **Shadow DOM encapsula estilos y DOM, pero NO es un boundary de seguridad.** Un MFE con XSS puede acceder a todo el shell y a sus hermanos.

### Lo que Shadow DOM aísla

- DOM subtree local
- Estilos scoped (CSS no se filtra ni se infiltra)
- Encapsulación de componentes

### Lo que Shadow DOM NO aísla

- Acceso a `window`, `document`, `localStorage`, `cookies`
- Comunicación via `CustomEvent` (si `composed: true`)
- Ejecución de scripts maliciosos

**Regla:** Tratar **cada MFE como no confiable** por defecto.

## Capas de defensa

### 1. Content Security Policy (CSP)

El shell define una CSP que aplica a **todos** los MFEs (comparten el mismo document).

#### Política implementada en desarrollo

El shell aplica las directivas generales mediante un `<meta http-equiv="Content-Security-Policy">` y sirve `frame-ancestors 'none'` mediante el header HTTP de Vite, porque esa directiva se ignora cuando se entrega desde un meta tag:

```
default-src 'self';
base-uri 'self';
object-src 'none';
form-action 'self';
script-src 'self' 'nonce-lit-mf-importmap' https://cdn.jsdelivr.net http://localhost:5174 http://localhost:5175;
style-src 'self' 'unsafe-inline';
connect-src 'self' http://localhost:5174 http://localhost:5175 https://dummyjson.com ws://localhost:5173 ws://localhost:5174 ws://localhost:5175;
img-src 'self' data: https:;
font-src 'self';
```

El nonce permite el import map inline sin habilitar `unsafe-inline` para scripts. En producción debe generarse un nonce diferente por respuesta desde el servidor y sustituir los orígenes locales por los dominios reales.

#### Ventaja sobre Module Federation

Con import maps (sin Module Federation), **no necesitamos** `'unsafe-eval'` ni `'unsafe-inline'` en `script-src`. Module Federation requiere `eval()` para bootstrap del shared scope; import maps no.

#### Evitar en producción

| Directiva | Riesgo |
|-----------|--------|
| `script-src 'unsafe-eval'` | Permite `eval()`, vector de XSS |
| `script-src 'unsafe-inline'` | Permite scripts inline, vector de XSS |
| `script-src *` | Permite scripts desde cualquier dominio |
| `connect-src *` | Permite conexiones a cualquier dominio |

#### Desarrollo vs Producción

La CSP de desarrollo mantiene las restricciones de script y solo añade los orígenes necesarios para Vite, los MFEs locales y DummyJSON. No se habilitan `unsafe-eval` ni `unsafe-inline` en `script-src`.

En producción, el servidor debe generar el nonce por respuesta, enviar toda la política como header HTTP —incluido `frame-ancestors`— y limitar `script-src`, `connect-src` e `img-src` a los dominios reales de la aplicación. La política no debe depender únicamente de un meta tag.

### 2. Subresource Integrity (SRI)

Las URLs del import map pueden incluir hashes SRI para verificar que el código no fue manipulado en tránsito.

#### Implementación

```json
{
  "imports": {
    "lit": "https://cdn.jsdelivr.net/npm/lit@3.3.0/index.js"
  },
  "integrity": {
    "https://cdn.jsdelivr.net/npm/lit@3.3.0/index.js": "sha384-abc123..."
  }
}
```

#### Limitaciones actuales

- SRI en import maps tiene soporte limitado en browsers (sept 2026)
- No todos los CDNs generan hashes SRI automáticamente
- Alternativa práctica: usar versiones pinneadas en URLs (ya lo hacemos)

#### Buenas prácticas

1. **Pinnear versiones** en URLs del import map (nunca `@latest`)
2. **Usar CDNs confiables** (jsDelivr, unpkg, esm.sh)
3. **Verificar hashes** cuando sea posible
4. **Auditar dependencias** regularmente

### 3. Validación de contratos

Cada MFE define un schema de sus eventos y atributos esperados. El shell valida en desarrollo.

#### Validación de eventos emitidos

```ts
// shell/src/mfe-loader.ts
const EVENT_SCHEMAS: Record<string, (detail: unknown) => boolean> = {
  'mfe-dashboard:order-selected': (detail) => {
    return detail && typeof detail === 'object'
      && typeof (detail as any).orderId === 'number';
  },
  'mfe-settings:theme-changed': (detail) => {
    return detail && typeof detail === 'object'
      && ['light', 'dark', 'auto'].includes((detail as any).theme);
  },
};

function validateEvent(event: CustomEvent): boolean {
  const validator = EVENT_SCHEMAS[event.type];
  if (!validator) {
    console.warn(`Unknown event type: ${event.type}`);
    return false;
  }
  return validator(event.detail);
}
```

#### Validación de atributos

```ts
// En desarrollo, validar que el MFE reciba atributos válidos
function validateMFEConfig(el: HTMLElement, config: Record<string, string>) {
  for (const [key, value] of Object.entries(config)) {
    if (!el.hasAttribute(key)) {
      console.warn(`MFE missing expected attribute: ${key}`);
    }
  }
}
```

### 4. Namespace en storage

Si un MFE necesita persistir datos en localStorage o sessionStorage, **DEBE** namespaced:

```ts
// ❌ Mal - colisiona con otros MFEs y el shell
localStorage.setItem('user', JSON.stringify(user));

// ✅ Bien - namespace con el nombre del MFE
localStorage.setItem('mfe-dashboard:filters', JSON.stringify(filters));
```

#### Formato

```
{mfe-name}:{key}
```

Ejemplos:
- `mfe-dashboard:filters`
- `mfe-dashboard:sort-preference`
- `mfe-settings:theme`
- `mfe-settings:locale`

### 5. MFEs de terceros → iframe sandbox

Si se incorpora un MFE de un equipo externo o terceros, **DEBE** aislarse en un iframe con sandbox:

```html
<iframe 
  sandbox="allow-scripts allow-forms" 
  src="https://third-party-mfe.com/widget.html"
></iframe>
```

#### Configuración de sandbox

| Permiso | Riesgo | Uso |
|---------|--------|-----|
| `allow-scripts` | Medio | Casi siempre necesario (el MFE necesita JS) |
| `allow-forms` | Bajo | Si el MFE tiene formularios |
| `allow-same-origin` | **CRÍTICO** | **NUNCA** usar - elimina el aislamiento |
| `allow-popups` | Medio | Solo para OAuth, links externos |
| `allow-top-navigation` | Alto | Evitar |

#### Sin `allow-same-origin`

El iframe corre en origin `null`:
- No puede acceder al DOM del shell
- No puede leer cookies ni localStorage del shell
- Puede hacer fetch a APIs públicas o con token Bearer
- Comunicación vía `postMessage` únicamente

```ts
// Shell envía mensaje al iframe
iframe.contentWindow.postMessage({ type: 'update-data', payload }, 'https://third-party-mfe.com');

// iframe responde
window.parent.postMessage({ type: 'action-completed', result }, '*');
```

## Riesgos comunes y mitigaciones

### 1. Cross-MFE XSS

**Riesgo:** Un MFE con XSS puede:
- Leer tokens del shell en `localStorage`
- Manipular el DOM de otros MFEs
- Emitir eventos maliciosos
- Navegar a URLs phishing

**Mitigación:**
- CSP estricta (sin `unsafe-eval`, sin `unsafe-inline`)
- Validación de todos los datos que entran al MFE (atributos, eventos)
- No usar `innerHTML` con datos no sanitizados
- Sanitizar datos con DOMPurify si es necesario

### 2. Token Leakage

**Riesgo:** Tokens de autenticación en `localStorage` o `sessionStorage` son accesibles por todos los MFEs.

**Mitigación:**
- Usar cookies `HttpOnly` y `SameSite` cuando sea posible
- Si se usa `localStorage`, namespace: `mfe-auth:token`
- No pasar tokens via URL (query params)
- Rotar tokens regularmente

### 3. Inconsistent CSP

**Riesgo:** Un MFE sirve su propia CSP que relaja las reglas del shell.

**Mitigación:**
- CSP se define **solo en el shell** (el HTML del shell)
- Los MFEs no sirven HTML con sus propios headers CSP
- En producción, el servidor configura CSP en la respuesta del shell

### 4. Event Hijacking

**Riesgo:** Un MFE malicioso escucha y modifica eventos de otros MFEs.

**Mitigación:**
- Eventos dispatchados en el propio elemento (no en `window`)
- `composed: true` permite cruzar Shadow DOM pero no da acceso al DOM
- Validar el `detail` de los eventos recibidos
- No confiar en datos de eventos sin validar

### 5. Dependency Confusion

**Riesgo:** Una dependencia maliciosa se publica con el mismo nombre que un paquete interno.

**Mitigación:**
- Usar scopes en npm (`@lit-mf/`) para paquetes internos
- Pinneear versiones exactas en import map
- Usar lockfiles (`pnpm-lock.yaml`)
- Auditar dependencias regularmente (npm audit, Socket.dev)

## Checklist de seguridad

### Shell

- [x] CSP estricta definida en el HTML del shell
- [x] Sin `'unsafe-eval'` ni `'unsafe-inline'` en `script-src`
- [x] `frame-ancestors 'none'` servido mediante header HTTP para prevenir clickjacking
- [x] `object-src 'none'` para prevenir plugins
- [x] URLs del import map con versiones pinneadas
- [ ] Validación de contratos de eventos en desarrollo

### MFEs

- [ ] Namespace en localStorage/sessionStorage
- [ ] No usar `innerHTML` con datos no sanitizados
- [ ] Sanitizar datos de entrada (atributos, eventos)
- [ ] Limpiar suscripciones en `disconnectedCallback`
- [ ] No exponer tokens ni datos sensibles en el DOM

### Comunicación

- [ ] CustomEvents dispatchados en el propio elemento
- [ ] Naming convention `{mfe-name}:{action}`
- [ ] Validación del `detail` de eventos recibidos
- [ ] No confiar en datos de eventos sin validar

### Infraestructura

- [ ] CSP servida desde el servidor (no solo en HTML)
- [ ] Headers de seguridad: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- [ ] HTTPS en producción
- [ ] Audit logs para eventos de seguridad

## Regla de oro

> **Un MFE con XSS en nuestro sistema tiene acceso a TODO: el DOM del shell, el storage de todos los MFEs, los tokens de autenticación, y la capacidad de emitir eventos maliciosos.** La CSP y la validación de contratos son las defensas reales. Shadow DOM es encapsulación, no seguridad.
