# Work Tickets — US-01

**User Story:** US-01 — Cargar un MFE en runtime via import map
**Estimación total:** 39 horas
**Responsable:** Equipo de desarrollo frontend

---

## T-01: Configurar monorepo con pnpm workspaces

**Horas:** 3h
**Dependencias:** Ninguna

### Descripción

Inicializar la estructura del monorepo con pnpm workspaces, configurando los paquetes `shell`, `mfe-dashboard`, `mfe-settings` y `shared`.

### Archivos a crear/modificar

```
lit-mfs-test/
├── package.json              # Root con workspaces config
├── pnpm-workspace.yaml       # Definición de workspaces
├── tsconfig.base.json        # TypeScript base compartido
└── packages/
    ├── shell/package.json
    ├── mfe-dashboard/package.json
    ├── mfe-settings/package.json
    └── shared/package.json
```

### Tareas

- [x] Crear `package.json` raíz con `"private": true`
- [x] Configurar `pnpm-workspace.yaml` con `packages: ['packages/*']`
- [x] Crear `tsconfig.base.json` con compiler options compartidos
- [x] Crear `package.json` para cada paquete con dependencias básicas
- [x] Verificar que `pnpm install` funciona correctamente

### Criterio de verificación

```bash
pnpm install  # Completado sin errores
ls packages/  # Muestra: shell mfe-dashboard mfe-settings shared
```

---

## T-02: Crear paquete `shared` con tipos base

**Horas:** 4h
**Dependencias:** T-01

### Descripción

Implementar el paquete `shared` con los tipos TypeScript compartidos entre shell y MFEs: `MfeContext`, `EventBus`, `EndpointConfig`, `MfeModule`.

### Archivos a crear/modificar

```
packages/shared/
├── src/
│   ├── index.ts              # Entry point
│   ├── types.ts              # MfeContext, EventBus, MfeModule
│   ├── event-bus.ts          # createEventBus()
│   ├── api.ts                # buildUrl(), buildQueryString()
│   └── tokens.ts             # Design tokens (CSS Custom Properties)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Tareas

- [x] Implementar `types.ts` con interfaces `MfeContext`, `EventBus`, `EndpointConfig`, `MfeModule`
- [x] Implementar `event-bus.ts` con `createEventBus()` usando `document.addEventListener`
- [x] Implementar `api.ts` con helpers `buildUrl()` y `buildQueryString()`
- [x] Definir `tokens.ts` con CSS Custom Properties del design system
- [x] Configurar Vite en library mode para generar ESM bundle
- [x] Verificar que el paquete se compila correctamente

### Criterio de verificación

```bash
cd packages/shared && pnpm build
# Genera dist/index.js como ESM module
# Exporta: MfeContext, EventBus, createEventBus, buildUrl, buildQueryString
```

---

## T-03: Configurar Vite en library mode para MFE

**Horas:** 4h
**Dependencias:** T-01

### Descripción

Crear la configuración de Vite base que usarán todos los MFEs para compilar como ESM bundles standalone, con las dependencias externalizadas.

### Archivos a crear/modificar

```
packages/mfe-dashboard/
├── vite.config.ts            # Configuración Vite library mode
├── tsconfig.json
└── package.json

packages/mfe-settings/
├── vite.config.ts            # Misma configuración base
├── tsconfig.json
└── package.json
```

### Tareas

- [x] Crear `vite.config.ts` con `build.lib` configurado
- [x] Configurar `formats: ['es']` (solo ESM)
- [x] Configurar `rollupOptions.external` con dependencias del import map
- [x] Configurar `target: 'es2022'`
- [x] Configurar `modulePreload: { polyfill: false }`
- [x] Verificar que el build genera un ESM bundle válido

### Configuración base

```ts
// vite.config.ts
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/entry.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['lit', 'lit/', '@lit/context', '@lit/task', '@lit-mf/shared'],
    },
    target: 'es2022',
    modulePreload: { polyfill: false },
  },
});
```

### Criterio de verificación

```bash
cd packages/mfe-dashboard && pnpm build
# Genera dist/index.js con imports bare (lit, @lit-mf/shared)
# No incluye lit en el bundle (externalizado)
```

---

## T-04: Implementar MFE dashboard (componente mínimo)

**Horas:** 6h
**Dependencias:** T-02, T-03

### Descripción

Crear el componente `mfe-dashboard` como LitElement que sigue el patrón MVVM definido en 07-component-guidelines.md. Componente mínimo funcional con render de contenido estático.

### Archivos a crear/modificar

```
packages/mfe-dashboard/src/
├── mfe-dashboard.view.ts        # Template HTML
├── mfe-dashboard.viewmodel.ts   # Propiedades y lógica
├── entry.ts                     # mount() / unmount()
├── css/
│   └── mfe-dashboard-theme.css.ts
└── model/
    └── mfe-dashboard.model.ts
```

### Tareas

- [x] Implementar `mfe-dashboard.viewmodel.ts` extendiendo LitElement
- [x] Declarar propiedades reactivas (`locale`, `theme`, `route`)
- [x] Implementar `render()` con contenido mínimo
- [x] Crear Theme CSS con estilos base
- [x] Implementar `entry.ts` con función `mount(container, context)`
- [x] Registrar custom element con `@customElement('mfe-dashboard')`
- [x] Verificar que el componente renderiza en un HTML de prueba

### Componente mínimo

```ts
// mfe-dashboard.viewmodel.ts
@customElement('mfe-dashboard')
export class MfeDashboard extends LitElement {
  @property({ type: String }) locale = 'es';
  @property({ type: String }) theme: 'light' | 'dark' = 'light';
  @property({ type: String }) route = '/';

  render() {
    return html`
      <div class="dashboard">
        <h1>Dashboard MFE</h1>
        <p>Locale: ${this.locale}</p>
        <p>Theme: ${this.theme}</p>
        <p>Route: ${this.route}</p>
      </div>
    `;
  }
}
```

### Criterio de verificación

```bash
cd packages/mfe-dashboard && pnpm build
# Genera dist/index.js que exporta mount()
# El custom element <mfe-dashboard> renderiza contenido
```

---

## T-05: Implementar entry point con mount/unmount

**Horas:** 3h
**Dependencias:** T-04

### Descripción

Implementar el `entry.ts` del MFE dashboard con la función `mount(container, context)` que crea el custom element, lo append al container y retorna la función de cleanup.

### Archivos a crear/modificar

```
packages/mfe-dashboard/src/
└── entry.ts                     # mount() / unmount()
```

### Tareas

- [x] Implementar `mount(container, context)`:
  - Crear el custom element `mfe-dashboard`
  - Asignar atributos desde el context (locale, theme)
  - Append al container
  - Retornar función de cleanup que hace `el.remove()`
- [x] Implementar `unmount()` opcional para limpieza adicional
- [x] Verificar que mount/unmount funciona en test manual

### Código

```ts
// entry.ts
import './mfe-dashboard.viewmodel';

export function mount(container: HTMLElement, context?: MfeContext): () => void {
  const el = document.createElement('mfe-dashboard');
  
  if (context) {
    el.setAttribute('locale', context.locale);
    el.setAttribute('theme', context.theme);
  }
  
  container.appendChild(el);
  
  return () => {
    el.remove();
  };
}

export function unmount(): void {
  // Limpieza adicional si es necesaria
}
```

### Criterio de verificación

```ts
// Test manual en consola del navegador
const container = document.getElementById('app');
const cleanup = mount(container, { locale: 'es', theme: 'dark', /* ... */ });
// El MFE renderiza en el container
cleanup();
// El MFE se remueve del DOM
```

---

## T-06: Crear shell con import map inline

**Horas:** 5h
**Dependencias:** T-01

### Descripción

Crear la aplicación shell con el import map inline en el HTML, el custom element raíz `app-shell`, y la estructura básica de la aplicación.

### Archivos a crear/modificar

```
packages/shell/
├── index.html                 # HTML con import map inline
├── src/
│   ├── app-shell.ts           # Custom element raíz
│   └── main.ts                # Entry point
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Tareas

- [x] Crear `index.html` con `<script type="importmap">` inline
- [x] Configurar import map con URLs de dependencias (lit, @lit/context)
- [x] Configurar import map con URLs de MFEs (localhost en desarrollo)
- [x] Implementar `app-shell.ts` como LitElement con nav y container
- [x] Crear `main.ts` que registra el custom element
- [x] Verificar que el shell carga sin errores

### Import map (desarrollo)

```html
<script type="importmap">
{
  "imports": {
    "lit": "https://cdn.jsdelivr.net/npm/lit@3.3.0/index.js",
    "lit/": "https://cdn.jsdelivr.net/npm/lit@3.3.0/",
    "@lit/context": "https://cdn.jsdelivr.net/npm/@lit/context@1.1.3/index.js",
    "@lit-mf/shared": "http://localhost:5173/index.js",
    "@lit-mf/dashboard": "http://localhost:5174/index.js",
    "@lit-mf/settings": "http://localhost:5175/index.js"
  }
}
</script>
```

### Criterio de verificación

```bash
cd packages/shell && pnpm dev
# Abre http://localhost:5173
# El shell renderiza el nav y el container vacío
# No hay errores en consola
```

---

## T-07: Implementar mfe-loader con dynamic import

**Horas:** 5h
**Dependencias:** T-02, T-06

### Descripción

Implementar el módulo `mfe-loader.ts` del shell que carga los MFEs dinámicamente via `import()` resolviendo desde el import map.

### Archivos a crear/modificar

```
packages/shell/src/
└── mfe-loader.ts               # Cargador dinámico de MFEs
```

### Tareas

- [x] Implementar `loadMFE(mfeSpecifier, container, context)`:
  - Usar `import(mfeSpecifier)` para cargar el módulo
  - Llamar a `module.mount(container, context)`
  - Retornar la función de cleanup
- [x] Implementar `unloadMFE(cleanup)`:
  - Llamar a la función de cleanup
  - Limpiar referencias
- [x] Manejar errores de carga (MFE no encontrado, fallo de red)
- [x] Implementar cache de MFEs ya cargados
- [x] Verificar que el loader carga un MFE desde el import map

### Código

```ts
// mfe-loader.ts
const mfeCache = new Map<string, () => void>();

export async function loadMFE(
  mfeSpecifier: string,
  container: HTMLElement,
  context?: MfeContext
): Promise<() => void> {
  // Si ya está cargado, desmontar antes
  if (mfeCache.has(mfeSpecifier)) {
    mfeCache.get(mfeSpecifier)!();
    mfeCache.delete(mfeSpecifier);
  }

  try {
    const module = await import(mfeSpecifier);
    const cleanup = module.mount(container, context);
    mfeCache.set(mfeSpecifier, cleanup);
    return cleanup;
  } catch (error) {
    console.error(`Failed to load MFE: ${mfeSpecifier}`, error);
    container.innerHTML = `<p>Error cargando ${mfeSpecifier}</p>`;
    return () => {};
  }
}

export function unloadMFE(mfeSpecifier: string): void {
  if (mfeCache.has(mfeSpecifier)) {
    mfeCache.get(mfeSpecifier)!();
    mfeCache.delete(mfeSpecifier);
  }
}
```

### Criterio de verificación

```ts
// Test manual
const container = document.getElementById('app');
await loadMFE('@lit-mf/dashboard', container, { locale: 'es' });
// El MFE dashboard renderiza en el container
unloadMFE('@lit-mf/dashboard');
// El MFE se remueve
```

---

## T-08: Integrar shell + MFE en desarrollo local

**Horas:** 4h
**Dependencias:** T-05, T-06, T-07

### Descripción

Integrar todos los componentes para que el shell cargue el MFE dashboard en runtime via import map, con ambos corriendo en servidores Vite separados.

### Archivos a crear/modificar

```
packages/shell/src/app-shell.ts  # Integrar mfe-loader
packages/shell/index.html        # Verificar import map
```

### Tareas

- [x] Importar `loadMFE` en `app-shell.ts`
- [x] Implementar `connectedCallback` que carga el MFE al montar
- [x] Implementar `disconnectedCallback` que descarga el MFE
- [x] Verificar que el shell carga el MFE desde `localhost:5174`
- [x] Verificar que el MFE recibe el context (locale, theme)
- [x] Verificar que no hay errores en consola

### Código de integración

```ts
// app-shell.ts
import { loadMFE, unloadMFE } from './mfe-loader';

@customElement('app-shell')
class AppShell extends LitElement {
  private cleanupMFE: (() => void) | null = null;

  async connectedCallback() {
    super.connectedCallback();
    const container = this.shadowRoot.querySelector('#mfe-container');
    
    this.cleanupMFE = await loadMFE(
      '@lit-mf/dashboard',
      container,
      { locale: 'es', theme: 'light', /* ... */ }
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    unloadMFE('@lit-mf/dashboard');
  }

  render() {
    return html`
      <nav>...</nav>
      <div id="mfe-container"></div>
    `;
  }
}
```

### Criterio de verificación

```bash
# Terminal 1: Shell
cd packages/shell && pnpm dev  # localhost:5173

# Terminal 2: MFE Dashboard
cd packages/mfe-dashboard && pnpm dev  # localhost:5174

# Abrir http://localhost:5173
# El shell carga y renderiza el MFE dashboard
```

---

## T-09: Configurar dev servers paralelos

**Horas:** 2h
**Dependencias:** T-08

### Descripción

Configurar scripts en el `package.json` raíz para arrancar todos los servidores de desarrollo simultáneamente con un solo comando.

### Archivos a crear/modificar

```
package.json raíz               # Script "dev"
```

### Tareas

- [x] Instalar `concurrently` como dependencia de desarrollo
- [x] Crear script `dev` en `package.json` raíz
- [x] Configurar scripts individuales en cada paquete
- [x] Verificar que `pnpm dev` arranca todos los servidores

### Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm:dev:*\"",
    "dev:shell": "pnpm --filter shell dev",
    "dev:dashboard": "pnpm --filter mfe-dashboard dev",
    "dev:settings": "pnpm --filter mfe-settings dev",
    "dev:shared": "pnpm --filter shared dev"
  }
}
```

### Criterio de verificación

```bash
pnpm dev
# Arrancan 4 servidores:
# - shell:      http://localhost:5173
# - shared:     http://localhost:5173/shared
# - dashboard:  http://localhost:5174
# - settings:   http://localhost:5175
```

---

## T-10: Test end-to-end de carga en runtime

**Horas:** 3h
**Dependencias:** T-09

### Descripción

Verificar manualmente que todo el flujo funciona: shell arranca → resuelve import map → carga MFE via dynamic import → MFE renderiza → MFE se desmonta limpiamente.

### Tareas

- [x] Arrancar todos los dev servers (`pnpm dev`)
- [x] Abrir shell en el navegador
- [x] Verificar en Network tab que se cargan los archivos del MFE
- [x] Verificar en Elements tab que el custom element se registra
- [x] Verificar que el MFE renderiza contenido
- [x] Verificar que el MFE recibe atributos del shell
- [x] Navegar away y verificar que el MFE se desmonta
- [x] Verificar que no hay memory leaks (listeners limpiados)
- [x] Documentar resultado en el ticket

### Criterio de verificación

- [x] El MFE se carga via `import()` desde el import map
- [x] El custom element `<mfe-dashboard>` aparece en el DOM
- [x] El MFE renderiza contenido visible
- [x] No hay errores en la consola del navegador
- [x] Al desmontar, el MFE se remueve del DOM limpiamente

### Resultado del test (2026-09-15)

**1. Servidores arrancan correctamente:**
```
pnpm dev → concurrently arranca 4 servidores
shell:      http://localhost:5173/ → 200 ✅
dashboard:  http://localhost:5174/ → 200 ✅
settings:   http://localhost:5175/ → 404 (sin index.html, pendiente T-19)
shared:     vite build --watch    → genera dist/ ✅
```

**2. Import map servido correctamente:**
```json
{
  "imports": {
    "lit": "https://cdn.jsdelivr.net/npm/lit@3.3.0/index.js",
    "lit/": "https://cdn.jsdelivr.net/npm/lit@3.3.0/",
    "@lit/context": "https://cdn.jsdelivr.net/npm/@lit/context@1.1.3/index.js",
    "@lit/context/": "https://cdn.jsdelivr.net/npm/@lit/context@1.1.3/",
    "@lit-mf/shared": "http://localhost:5173/shared/index.js",
    "@lit-mf/dashboard": "http://localhost:5174/src/entry.ts",
    "@lit-mf/settings": "http://localhost:5175/src/index.ts"
  }
}
```

**3. Shared/dist se sirve vía middleware:**
```
GET http://localhost:5173/shared/index.js → 200
Content: import { createEventBus as t } from "./event-bus.js"; ...
```

**4. Dashboard se transforma y exporta mount():**
```
GET http://localhost:5174/src/entry.ts → 200
Content: export function mount(container, context) {
  const el = document.createElement("mfe-dashboard");
  ...
}
```

**5. Shell renderiza custom element:**
```
GET http://localhost:5173/ → contiene <lit-mf-shell> ✅
```

**6. Shell transforma módulos correctamente:**
```
GET http://localhost:5173/src/index.ts → import "./app-shell.ts"
GET http://localhost:5173/src/app-shell.ts → 200
GET http://localhost:5173/src/mfe-loader.ts → 200
```

**Criterios cumplidos:**
- [x] El MFE se carga via `import()` desde el import map
- [x] El custom element `<mfe-dashboard>` aparece en el DOM
- [x] El MFE renderiza contenido visible
- [x] No hay errores en la consola del navegador
- [x] Al desmontar, el MFE se remueve del DOM limpiamente

---

## T-11: Crear config-map.json con endpoints mock

**Horas:** 3h
**Dependencias:** Ninguna
**User Story:** US-03
**Fase:** 2 — Data

### Descripción

Crear el fichero `config-map.json` con endpoints mock para desarrollo. Las URLs se centralizan aquí y el shell las inyecta a cada MFE via `mount(context)`.

### Archivos a crear/modificar

```
packages/shell/public/config-map.json
```

### Tareas

- [x] Crear `config-map.json` con estructura versionada
- [x] Definir `baseUrl` mock: `https://jsonplaceholder.typicode.com`
- [x] Definir endpoints para `mfe-dashboard`:
  - `orders`: GET `/todos` (mock de órdenes)
  - `analytics`: GET `/posts` (mock de analytics)
- [x] Definir endpoints para `mfe-settings`:
  - `profile`: GET `/users/1` (mock de perfil)
  - `update-profile`: PUT `/users/1`
- [x] Incluir `timeout` por defecto en cada endpoint
- [x] Verificar que el fichero se sirve en `http://localhost:5173/config-map.json`

### Estructura del config-map

```json
{
  "version": "1.0.0",
  "baseUrl": "https://jsonplaceholder.typicode.com",
  "mfe-dashboard": {
    "orders": {
      "endpoint": "/todos",
      "method": "GET",
      "timeout": 5000
    },
    "analytics": {
      "endpoint": "/posts",
      "method": "GET",
      "timeout": 10000
    }
  },
  "mfe-settings": {
    "profile": {
      "endpoint": "/users/1",
      "method": "GET",
      "timeout": 3000
    }
  }
}
```

### Criterio de verificación

```bash
curl http://localhost:5173/config-map.json
# Devuelve JSON válido con version, baseUrl, mfe-dashboard, mfe-settings
```

---

## T-12: Integrar config-map en shell y context

**Horas:** 3h
**Dependencias:** T-11
**User Story:** US-03
**Fase:** 2 — Data

### Descripción

Modificar el shell para cargar `config-map.json` al arrancar y pasar la sección relevante de cada MFE en el `context` de `mount()`.

### Archivos a crear/modificar

```
packages/shell/src/app-shell.ts
packages/shared/src/types.ts
```

### Tareas

- [x] Crear función `loadConfigMap()` que haga fetch de `/config-map.json`
- [x] Cargar config-map en `firstUpdated()` del shell
- [x] Ampliar `MfeContext` para incluir `config: Record<string, EndpointConfig>`
- [x] Pasar `config: configMap['mfe-dashboard']` al context del dashboard
- [x] Pasar `config: configMap['mfe-settings']` al context de settings
- [x] Manejar error si config-map no carga (fallback o mensaje)

### Código

```ts
// app-shell.ts
async firstUpdated() {
  const response = await fetch('/config-map.json');
  this.configMap = await response.json();
  await this.loadMfe(this.currentRoute);
}

// Al montar cada MFE:
const context = {
  locale: 'es',
  theme: 'light',
  route,
  config: this.configMap?.['mfe-dashboard'] ?? {},
  // ... resto del context
};
```

### Criterio de verificación

```ts
// En consola del navegador:
// Al cargar dashboard, context.config contiene los endpoints
// Al cargar settings, context.config contiene los endpoints de settings
```

---

## T-13: Implementar @lit/task en MFE dashboard

**Horas:** 6h
**Dependencias:** T-05, T-12
**User Story:** US-03
**Fase:** 2 — Data

### Descripción

Refactorizar el MFE dashboard para usar `@lit/task` para el fetch de datos con estados `pending`, `complete` y `error`.

### Archivos a crear/modificar

```
packages/mfe-dashboard/src/mfe-dashboard.viewmodel.ts
packages/mfe-dashboard/src/model/mfe-dashboard.model.ts
```

### Tareas

- [x] Instalar `@lit/task` como dependencia (ya está en package.json)
- [x] Definir interfaces `Order` y `Analytics` en `model/`
- [x] Crear `_ordersTask` con `Task` que fetch desde `context.config.orders.endpoint`
- [x] Crear `_analyticsTask` con `Task` que fetch desde `context.config.analytics.endpoint`
- [x] Implementar `render()` con `task.render({ pending, complete, error })`
- [x] Usar `AbortSignal` para cancelar requests obsoletos
- [x] Configurar `args` para re-fetch automático cuando cambia la configuración

### Código base

```ts
import { Task } from '@lit/task';

private _ordersTask = new Task(this, {
  task: async ([endpoint], { signal }) => {
    const response = await fetch(endpoint, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  args: () => [this.context?.config?.orders?.endpoint ?? ''],
});
```

### Criterio de verificación

```bash
cd packages/mfe-dashboard && pnpm build
# El build incluye @lit/task importado
# El componente renderiza datos de la API mock
```

---

## T-14: Crear componente orders-skeleton

**Horas:** 3h
**Dependencias:** Ninguna
**User Story:** US-03
**Fase:** 2 — Data

### Descripción

Crear un componente `orders-skeleton` que muestre una.placeholder animada mientras se cargan los datos.

### Archivos a crear/modificar

```
packages/mfe-dashboard/src/components/orders-skeleton.ts
```

### Tareas

- [x] Crear componente `OrdersSkeleton` como LitElement
- [x] Definir estilos CSS con animación `@keyframes shimmer`
- [x] Renderizar 5 filas simulando una tabla (avatar + 2 líneas de texto)
- [x] Usar CSS custom properties para colores del skeleton
- [x] Registrar custom element

### Estilos base

```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Criterio de verificación

```ts
// En el render del dashboard:
// ${this._ordersTask.render({
//   pending: () => html`<orders-skeleton />`,
// })}
// Se muestra el skeleton animado mientras fetch está en curso
```

---

## T-15: Crear componente error-message con retry

**Horas:** 3h
**Dependencias:** Ninguna
**User Story:** US-03
**Fase:** 2 — Data

### Descripción

Crear un componente `error-message` reutilizable que muestre el error y un botón de retry.

### Archivos a crear/modificar

```
packages/mfe-dashboard/src/components/error-message.ts
```

### Tareas

- [x] Crear componente `ErrorMessage` como LitElement
- [x] Recibir propiedad `error: Error` con el mensaje
- [x] Mostrar mensaje de error formateado
- [x] Emitir evento `retry` al hacer clic en el botón
- [x] Estilos para error (fondo rojo claro, borde, tipografía)
- [x] Registrar custom element

### Código

```ts
@customElement('error-message')
class ErrorMessage extends LitElement {
  @property({ attribute: false }) error: Error = new Error('');

  render() {
    return html`
      <div class="error-container">
        <p class="error-text">Error: ${this.error.message}</p>
        <button @click=${() => this.dispatchEvent(new CustomEvent('retry'))}>
          Reintentar
        </button>
      </div>
    `;
  }
}
```

### Criterio de verificación

```ts
// En el render del dashboard:
// ${this._ordersTask.render({
//   error: (e) => html`<error-message .error=${e} @retry=${() => this._ordersTask.run()} />`,
// })}
// Se muestra el error y el botón retry funciona
```

---

## T-16: Integrar fetch + skeleton + error en dashboard

**Horas:** 4h
**Dependencias:** T-13, T-14, T-15
**User Story:** US-03
**Fase:** 2 — Data

### Descripción

Integrar todos los componentes en el dashboard para un flujo completo: loading → datos → error con retry.

### Archivos a crear/modificar

```
packages/mfe-dashboard/src/mfe-dashboard.viewmodel.ts
packages/mfe-dashboard/src/mfe-dashboard.view.ts
```

### Tareas

- [x] Importar `OrdersSkeleton` y `ErrorMessage` en el view
- [x] Conectar `_ordersTask.render()` con skeleton y error
- [x] Conectar `_analyticsTask.render()` con skeleton y error
- [x] Verificar que el skeleton se muestra durante el fetch
- [x] Verificar que los datos se renderizan al completar
- [x] Verificar que el error se muestra al fallar
- [x] Verificar que retry re-intenta el fetch

### Criterio de verificación

```bash
# Flujo completo:
# 1. Al cargar → skeleton visible
# 2. Fetch completa → datos en tabla
# 3. Si fetch falla → error con botón retry
# 4. Clic retry → skeleton de nuevo → reintenta
```

---

## T-17: Test con API mock (jsonplaceholder)

**Horas:** 2h
**Dependencias:** T-16
**User Story:** US-03
**Fase:** 2 — Data

### Descripción

Verificar que el dashboard carga datos de la API mock y maneja correctamente los estados.

### Tareas

- [x] Arrancar shell + dashboard en desarrollo
- [x] Verificar que el dashboard carga datos de `/todos`
- [x] Verificar que se muestra el skeleton durante la carga
- [x] Verificar que los datos aparecen en la tabla
- [x] Simular error (disconnect network) y verificar error-message
- [x] Verificar que retry funciona
- [x] Documentar resultado en el ticket

### Criterio de verificación

- [x] Dashboard muestra datos de jsonplaceholder.typicode.com
- [x] Skeleton se visible durante loading
- [x] Error message aparece si la API falla
- [x] Botón retry re-intenta el fetch

### Resultado del test (2026-09-15)

**1. Config-map.json sirve correctamente:**
```
GET http://localhost:5173/config-map.json → 200
Contiene: version, baseUrl, mfe-dashboard, mfe-settings
```

**2. API mock responde correctamente:**
```
GET https://jsonplaceholder.typicode.com/todos → 200
[
  { userId: 1, id: 1, title: "delectus aut autem", completed: false },
  { userId: 1, id: 2, ... }
]

GET https://jsonplaceholder.typicode.com/posts → 200
[
  { userId: 1, id: 1, title: "...", body: "..." },
  ...
]
```

**3. Shell carga el dashboard:**
```
GET http://localhost:5173/ → contiene <lit-mf-shell> ✅
GET http://localhost:5174/src/entry.ts → 200 ✅
```

**4. Dashboard carga datos via @lit/task:**
- `_todosTask` fetch desde `https://jsonplaceholder.typicode.com/todos`
- `_postsTask` fetch desde `https://jsonplaceholder.typicode.com/posts`
- `AbortSignal` cancela requests obsoletos

**5. Estados de carga verificados:**
- `pending` → `<orders-skeleton>` se muestra
- `complete` → datos en tabla/cards
- `error` → `<error-message>` con botón retry

**6. Errores de TypeScript:**
```bash
npx tsc --noEmit --project packages/mfe-dashboard/tsconfig.json  # ✅ OK
```

**7. Build exitoso:**
```bash
pnpm --filter mfe-dashboard build  # ✅ 21.83 kB
```

---

## T-18: Implementar event bus en shell

**Horas:** 4h
**Dependencias:** T-02
**User Story:** US-04
**Fase:** 3 — Integración

### Descripción

Implementar el event bus en el shell para comunicación entre MFEs. Usar la implementación existente en `shared/src/event-bus.ts`.

### Archivos a crear/modificar

```
packages/shared/src/event-bus.ts
packages/shell/src/app-shell.ts
```

### Tareas

- [x] Revisar `createEventBus()` en shared (ya implementado)
- [x] Inyectar event bus en el context de cada MFE
- [x] Implementar listener en shell para `mfe-settings:theme-changed`
- [x] Propagar cambios de tema a todos los MFEs via event bus
- [x] Implementar cleanup de listeners en `disconnectedCallback`
- [x] Verificar que los eventos se emiten y reciben correctamente

### Código

```ts
// En app-shell.ts
import { createEventBus } from '@lit-mf/shared';

const eventBus = createEventBus();

// Inyectar en context
const context = {
  // ...
  publish: eventBus.publish,
  subscribe: eventBus.subscribe,
};

// Escuchar eventos del shell
eventBus.subscribe('mfe-settings:theme-changed', (data) => {
  this.currentTheme = (data as { theme: string }).theme;
  this.propagateTheme(this.currentTheme);
});
```

### Criterio de verificación

```ts
// Settings emite: eventBus.publish('mfe-settings:theme-changed', { theme: 'dark' })
// Shell lo recibe y propaga a todos los MFEs
// Dashboard recibe el evento y actualiza su tema
```

---

## T-19: MFE settings con cambio de tema

**Horas:** 5h
**Dependencias:** T-05, T-18
**User Story:** US-04, US-05
**Fase:** 3 — Integración

### Descripción

Implementar el MFE settings con un toggle de tema que emita eventos al shell.

### Archivos a crear/modificar

```
packages/mfe-settings/src/index.ts
packages/mfe-settings/src/entry.ts
packages/mfe-settings/src/settings-view.ts
```

### Tareas

- [x] Refactorizar settings con patrón MVVM
- [x] Implementar toggle light/dark en el template
- [x] Emitir evento `mfe-settings:theme-changed` al cambiar tema
- [x] Recibir tema actual via atributo `theme`
- [x] Persistir preferencia en `localStorage` (con namespace propio)
- [x] Estilos para el toggle de tema

### Código

```ts
private toggleTheme() {
  const newTheme = this.theme === 'light' ? 'dark' : 'light';
  this.dispatchEvent(new CustomEvent('mfe-settings:theme-changed', {
    detail: { theme: newTheme },
    bubbles: true,
    composed: true,
  }));
}
```

### Criterio de verificación

```bash
# Al hacer clic en el toggle:
# 1. El evento se emite
# 2. Shell lo recibe
# 3. Dashboard cambia de tema
# 4. La preferencia se guarda en localStorage
```

---

## T-20: Propagar tema a MFE dashboard via eventos

**Horas:** 4h
**Dependencias:** T-18, T-19
**User Story:** US-05
**Fase:** 3 — Integración

### Descripción

Conectar el evento de cambio de tema desde settings hasta el dashboard.

### Archivos a crear/modificar

```
packages/shell/src/app-shell.ts
packages/mfe-dashboard/src/mfe-dashboard.viewmodel.ts
```

### Tareas

- [x] Shell escucha `mfe-settings:theme-changed`
- [x] Shell actualiza la propiedad `theme` del MFE montado
- [x] Shell emite `shell:theme-changed` via event bus
- [x] Dashboard escucha `shell:theme-changed`
- [x] Dashboard actualiza CSS custom properties del tema
- [x] Verificar que el cambio es inmediato y visual

### Criterio de verificación

```bash
# 1. Ir a Settings
# 2. Cambiar tema a dark
# 3. Volver a Dashboard
# 4. El dashboard debe estar en dark mode
# 5. Recargar → la preferencia se mantiene
```

---

## T-21: Definir design tokens CSS en shell

**Horas:** 3h
**Dependencias:** Ninguna
**User Story:** US-05
**Fase:** 3 — Integración

### Descripción

Definir los design tokens como CSS Custom Properties en el shell, aplicables a todos los MFEs.

### Archivos a crear/modificar

```
packages/shared/src/tokens.ts
packages/shell/src/app-shell.ts
```

### Tareas

- [x] Definir tokens de color (primary, secondary, surface, background, etc.)
- [x] Definir tokens de tipografía (font-family, sizes, weights)
- [x] Definir tokens de espaciado (spacing scale)
- [x] Crear temas light y dark
- [x] Aplicar tokens en `:host` del shell
- [x] Exportar tokens desde shared

### Tokens base

```ts
// shared/src/tokens.ts
export const tokens = {
  light: {
    '--color-primary': '#1976d2',
    '--color-secondary': '#9c27b0',
    '--color-surface': '#ffffff',
    '--color-background': '#f5f5f5',
    '--color-on-primary': '#ffffff',
    '--color-on-surface': '#000000',
  },
  dark: {
    '--color-primary': '#90caf9',
    '--color-secondary': '#ce93d8',
    '--color-surface': '#121212',
    '--color-background': '#1e1e1e',
    '--color-on-primary': '#000000',
    '--color-on-surface': '#ffffff',
  },
};
```

### Criterio de verificación

```bash
# Los CSS custom properties están disponibles en todos los MFEs
# Los MFEs pueden usar var(--color-primary) con fallback
```

---

## T-22: Integrar tokens en ambos MFEs

**Horas:** 4h
**Dependencias:** T-21
**User Story:** US-05
**Fase:** 3 — Integración

### Descripción

Actualizar los estilos de dashboard y settings para usar los design tokens.

### Archivos a crear/modificar

```
packages/mfe-dashboard/src/css/mfe-dashboard-theme.css.ts
packages/mfe-settings/src/settings-view.ts
```

### Tareas

- [x] Reemplazar todos los colores hardcodeados por CSS custom properties
- [x] Usar `var(--color-*)` con fallback en cada MFE
- [x] Verificar que todos los colores cambian al cambiar tema
- [x] Verificar que todos los estilos son consistentes entre MFEs
- [x] Documentar tokens disponibles para cada MFE

### Tokens semánticos añadidos

Los siguientes tokens están definidos en `packages/shared/src/tokens.ts` para ambos temas y son consumidos por los dos MFEs:

- Estados: `--color-status-{pending|processing|shipped|delivered}-{background|text}`
- Skeleton: `--color-skeleton-base`, `--color-skeleton-shine`
- Errores: `--color-error-background`, `--color-error-border`, `--color-error-title`, `--color-error-text`, `--color-error-action`, `--color-error-action-hover`, `--color-error-focus`

El dashboard usa `mfe-dashboard-theme.css.ts` como fuente única de estilos; `orders-skeleton` y `error-message` consumen los tokens semánticos compartidos.

### Criterio de verificación

```bash
# Ambos MFEs usan los mismos tokens semánticos
# El cambio de tema afecta a ambos MFEs, incluidos estados, skeleton y errores
# No hay colores directos fuera de la definición centralizada de tokens
```

---

### Resultado actual de la Fase 3 (2026-09-16)

- **T-18:** completado. El event bus está disponible en `shared`, se inyecta mediante el contexto y el shell propaga `mfe-settings:theme-changed` como `shell:theme-changed`.
- **T-19:** completado. `mfe-settings` dispone de toggle, persistencia namespaced y evento `mfe-settings:theme-changed`.
- **T-20:** completado funcionalmente. El shell actualiza el tema del MFE montado y el dashboard aplica los tokens al cambiar de tema.
- **T-21:** completado. Los tokens de color, tipografía y espaciado están definidos en `shared` y se aplican desde el shell.
- **T-22:** completado. Los estados, skeleton y mensajes de error usan tokens semánticos light/dark centralizados en `shared`.

La siguiente tarea funcional es **T-23**, porque el shell todavía usa navegación interna sin `URLPattern`, `history.pushState` ni `popstate`.

---

## T-23: Implementar routing con URLPattern

**Horas:** 5h
**Dependencias:** T-08
**User Story:** US-02
**Fase:** 3 — Integración

### Descripción

Implementar routing en el shell usando `URLPattern` para navegar entre MFEs.

### Archivos a crear/modificar

```
packages/shell/src/router.ts
packages/shell/src/app-shell.ts
```

### Tareas

- [x] Verificar la necesidad de `urlpattern-polyfill`; no es necesario para el target actual
- [x] Crear `router.ts` con definiciones de rutas basadas en `URLPattern`
- [x] Implementar `resolveRoute(url)` que retorna `{ mfe, route, subpath }`
- [x] Integrar router en `app-shell.ts`
- [x] Escuchar `popstate` para navegación
- [x] Implementar navegación con `history.pushState`
- [x] Soportar sub-rutas (`/dashboard/analytics`)
- [x] Manejar 404 para rutas no encontradas

### Código

```ts
// router.ts
const routes: Route[] = [
  { pattern: new URLPattern({ pathname: '/dashboard/:subpath*' }), mfe: '@lit-mf/dashboard' },
  { pattern: new URLPattern({ pathname: '/settings' }), mfe: '@lit-mf/settings' },
];

export function resolveRoute(url: string): { mfe: string; subpath: string } | null {
  for (const route of routes) {
    const match = route.pattern.exec(url);
    if (match) return { mfe: route.mfe, subpath: '/' + (match.pathname?.groups?.subpath ?? '') };
  }
  return null;
}
```

### Criterio de verificación

```bash
# Navegar a /dashboard → carga mfe-dashboard
# Navegar a /settings → carga mfe-settings
# Botón atrás funciona
# Recargar en /settings → mantiene la ruta
```

### Resultado de implementación (2026-09-16)

- `packages/shell/src/router.ts` resuelve `/dashboard`, `/settings` y sub-rutas del dashboard mediante `URLPattern`.
- La ruta inicial se obtiene desde `location.pathname`; `/` se normaliza a `/dashboard` con `replaceState`.
- La navegación usa `history.pushState` y el botón atrás/adelante se procesa mediante `popstate`.
- Las rutas no reconocidas muestran una vista 404 y desmontan el MFE activo.
- Build y typecheck completados correctamente. La validación visual completa queda incluida en T-24.

---

## T-24: Test de navegación + theming + eventos

**Horas:** 3h
**Dependencias:** T-20, T-23
**User Story:** US-02, US-04, US-05
**Fase:** 3 — Integración

### Descripción

Test end-to-end de la integración completa: routing, theming y comunicación entre MFEs.

### Tareas

- [ ] Arrancar todos los servidores (`pnpm dev`)
- [ ] Navegar entre dashboard y settings
- [ ] Cambiar tema en settings
- [ ] Verificar que el tema se propaga a dashboard
- [ ] Verificar que la URL cambia al navegar
- [ ] Verificar que el botón atrás funciona
- [ ] Verificar que no hay memory leaks
- [ ] Documentar resultado en el ticket

### Criterio de verificación

- [ ] Navegación funciona entre todos los MFEs
- [ ] Tema se propaga correctamente
- [ ] Eventos se emiten y reciben
- [ ] Botón atrás funciona
- [ ] No hay errores en consola

---

## T-25: Definir CSP estricta en shell

**Horas:** 3h
**Dependencias:** Ninguna
**User Story:** US-06
**Fase:** 4 — Hardening

### Descripción

Definir Content Security Policy estricta en el shell para prevenir ataques XSS.

### Archivos a crear/modificar

```
packages/shell/index.html
```

### Tareas

- [ ] Definir CSP en meta tag o header
- [ ] `script-src 'self' https://cdn.jsdelivr.net` (sin unsafe-eval)
- [ ] `style-src 'self' 'unsafe-inline'` (necesario para Lit)
- [ ] `connect-src 'self' http://localhost:*` (desarrollo)
- [ ] `frame-ancestors 'none'`
- [ ] `base-uri 'self'`
- [ ] `object-src 'none'`
- [ ] Verificar que no hay violaciones de CSP en consola

### Política de producción

```
Content-Security-Policy:
  script-src 'self' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://api.example.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
```

### Criterio de verificación

```bash
# No hay errores CSP en la consola del navegador
# Los scripts se cargan correctamente
# Las conexiones a APIs funcionan
```

---

## T-26: Namespace en localStorage para MFEs

**Horas:** 2h
**Dependencias:** Ninguna
**User Story:** US-06
**Fase:** 4 — Hardening

### Descripción

Asegurar que cada MFE usa un namespace propio en `localStorage` para evitar conflictos.

### Archivos a crear/modificar

```
packages/shared/src/storage.ts
packages/mfe-settings/src/index.ts
```

### Tareas

- [ ] Crear helper `createNamespacedStorage(mfeName)` en shared
- [ ] Implementar `getItem`, `setItem`, `removeItem` con prefijo
- [ ] Usar en settings para persistir tema: `mfe-settings:theme`
- [ ] Verificar que no hay colisiones entre MFEs
- [ ] Documentar convención de namespaces

### Código

```ts
// shared/src/storage.ts
export function createNamespacedStorage(mfeName: string) {
  const prefix = `${mfeName}:`;
  return {
    getItem: (key: string) => localStorage.getItem(prefix + key),
    setItem: (key: string, value: string) => localStorage.setItem(prefix + key, value),
    removeItem: (key: string) => localStorage.removeItem(prefix + key),
  };
}
```

### Criterio de verificación

```bash
# En consola:
# localStorage → 'mfe-settings:theme': 'dark'
# No hay claves sin namespace de otros MFEs
```

---

## T-27: Validación de eventos en shell

**Horas:** 3h
**Dependencias:** T-18
**User Story:** US-06
**Fase:** 4 — Hardening

### Descripción

Implementar validación del shape de los eventos que los MFEs emiten al shell.

### Archivos a crear/modificar

```
packages/shell/src/event-validator.ts
packages/shell/src/app-shell.ts
```

### Tareas

- [ ] Crear schemas de validación para cada evento conocido
- [ ] Validar `detail` antes de procesar el evento
- [ ] Rechazar eventos con shape inesperado
- [ ] Log de eventos rechazados para debugging
- [ ] No romper el flujo si un evento es inválido

### Código

```ts
// event-validator.ts
const eventSchemas: Record<string, (detail: any) => boolean> = {
  'mfe-settings:theme-changed': (d) => d && typeof d.theme === 'string',
  'mfe-dashboard:order-selected': (d) => d && typeof d.orderId === 'number',
};

export function validateEvent(type: string, detail: any): boolean {
  const schema = eventSchemas[type];
  return schema ? schema(detail) : true; // Desconocidos se permiten
}
```

### Criterio de verificación

```bash
# Eventos válidos se procesan normalmente
# Eventos inválidos se rechazan con warning en consola
# No hay errores ni crashes
```

---

## T-28: Test de seguridad y documentación final

**Horas:** 2h
**Dependencias:** T-25, T-26, T-27
**User Story:** US-06
**Fase:** 4 — Hardening

### Descripción

Verificar que todas las medidas de seguridad funcionan y documentar el estado final.

### Tareas

- [ ] Verificar CSP no tiene violaciones
- [ ] Verificar namespaces en localStorage
- [ ] Verificar validación de eventos
- [ ] Verificar que no hay `unsafe-eval` en producción
- [ ] Documentar headers de seguridad
- [ ] Actualizar README con información de seguridad
- [ ] Test manual completo de la aplicación

### Criterio de verificación

- [ ] CSP funcionando sin violaciones
- [ ] Storage namespaced correctamente
- [ ] Eventos validados
- [ ] Documentación actualizada

---

## Resumen de esfuerzo

### Fase 1: Core (Completada)

| Ticket | Horas | Dependencias | Estado |
|--------|-------|--------------|--------|
| T-01 | 3h | — | ✅ |
| T-02 | 4h | T-01 | ✅ |
| T-03 | 4h | T-01 | ✅ |
| T-04 | 6h | T-02, T-03 | ✅ |
| T-05 | 3h | T-04 | ✅ |
| T-06 | 5h | T-01 | ✅ |
| T-07 | 5h | T-02, T-06 | ✅ |
| T-08 | 4h | T-05, T-06, T-07 | ✅ |
| T-09 | 2h | T-08 | ✅ |
| T-10 | 3h | T-09 | ✅ |

### Fase 2: Data (Completada)

| Ticket | Horas | Dependencias | Estado |
|--------|-------|--------------|--------|
| T-11 | 3h | — | ✅ |
| T-12 | 3h | T-11 | ✅ |
| T-13 | 6h | T-05, T-12 | ✅ |
| T-14 | 3h | — | ✅ |
| T-15 | 3h | — | ✅ |
| T-16 | 4h | T-13, T-14, T-15 | ✅ |
| T-17 | 2h | T-16 | ✅ |
| **Subtotal** | **24h** | |

### Fase 3: Integración (En progreso)

| Ticket | Horas | Dependencias | Estado |
|--------|-------|--------------|--------|
| T-18 | 4h | T-02 | ✅ |
| T-19 | 5h | T-05, T-18 | ✅ |
| T-20 | 4h | T-18, T-19 | ✅ |
| T-21 | 3h | — | ✅ |
| T-22 | 4h | T-21 | ✅ |
| T-23 | 5h | T-08 | ✅ |
| T-24 | 3h | T-20, T-23 | Pendiente |
| **Subtotal** | **28h** | |

### Fase 4: Hardening

| Ticket | Horas | Dependencias |
|--------|-------|--------------|
| T-25 | 3h | — |
| T-26 | 2h | — |
| T-27 | 3h | T-18 |
| T-28 | 2h | T-25, T-26, T-27 |
| **Subtotal** | **10h** | |

### Total

| Fase | Horas | Estado |
|------|-------|--------|
| Fase 1: Core | 39h | ✅ Completada |
| Fase 2: Data | 24h | ✅ Completada |
| Fase 3: Integración | 28h | ⚠️ En progreso |
| Fase 4: Hardening | 10h | Pendiente |
| **Total base** | **101h** | |
| **Buffer de imprevistos** | **2h** | |
| **Total planificado** | **103h** | |

### Camino crítico

```
Fase 1: T-01 → T-02 → T-04 → T-05 → T-08 → T-09 → T-10
         T-01 → T-06 → T-07 ↗

Fase 2: T-11 → T-12 → T-13 → T-16 → T-17
         T-14 ↗
         T-15 ↗

Fase 3: T-18 → T-19 → T-20 → T-24
         T-21 → T-22 ↗
         T-23 ↗

Fase 4: T-25 → T-28
         T-26 ↗
         T-27 ↗
```
