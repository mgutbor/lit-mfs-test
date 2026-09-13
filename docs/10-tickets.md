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

- [ ] Crear `package.json` raíz con `"private": true`
- [ ] Configurar `pnpm-workspace.yaml` con `packages: ['packages/*']`
- [ ] Crear `tsconfig.base.json` con compiler options compartidos
- [ ] Crear `package.json` para cada paquete con dependencias básicas
- [ ] Verificar que `pnpm install` funciona correctamente

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

- [ ] Implementar `types.ts` con interfaces `MfeContext`, `EventBus`, `EndpointConfig`, `MfeModule`
- [ ] Implementar `event-bus.ts` con `createEventBus()` usando `document.addEventListener`
- [ ] Implementar `api.ts` con helpers `buildUrl()` y `buildQueryString()`
- [ ] Definir `tokens.ts` con CSS Custom Properties del design system
- [ ] Configurar Vite en library mode para generar ESM bundle
- [ ] Verificar que el paquete se compila correctamente

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

- [ ] Crear `vite.config.ts` con `build.lib` configurado
- [ ] Configurar `formats: ['es']` (solo ESM)
- [ ] Configurar `rollupOptions.external` con dependencias del import map
- [ ] Configurar `target: 'es2022'`
- [ ] Configurar `modulePreload: { polyfill: false }`
- [ ] Verificar que el build genera un ESM bundle válido

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

- [ ] Implementar `mfe-dashboard.viewmodel.ts` extendiendo LitElement
- [ ] Declarar propiedades reactivas (`locale`, `theme`, `route`)
- [ ] Implementar `render()` con contenido mínimo
- [ ] Crear Theme CSS con estilos base
- [ ] Implementar `entry.ts` con función `mount(container, context)`
- [ ] Registrar custom element con `@customElement('mfe-dashboard')`
- [ ] Verificar que el componente renderiza en un HTML de prueba

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

- [ ] Implementar `mount(container, context)`:
  - Crear el custom element `mfe-dashboard`
  - Asignar atributos desde el context (locale, theme)
  - Append al container
  - Retornar función de cleanup que hace `el.remove()`
- [ ] Implementar `unmount()` opcional para limpieza adicional
- [ ] Verificar que mount/unmount funciona en test manual

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

- [ ] Crear `index.html` con `<script type="importmap">` inline
- [ ] Configurar import map con URLs de dependencias (lit, @lit/context)
- [ ] Configurar import map con URLs de MFEs (localhost en desarrollo)
- [ ] Implementar `app-shell.ts` como LitElement con nav y container
- [ ] Crear `main.ts` que registra el custom element
- [ ] Verificar que el shell carga sin errores

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

- [ ] Implementar `loadMFE(mfeSpecifier, container, context)`:
  - Usar `import(mfeSpecifier)` para cargar el módulo
  - Llamar a `module.mount(container, context)`
  - Retornar la función de cleanup
- [ ] Implementar `unloadMFE(cleanup)`:
  - Llamar a la función de cleanup
  - Limpiar referencias
- [ ] Manejar errores de carga (MFE no encontrado, fallo de red)
- [ ] Implementar cache de MFEs ya cargados
- [ ] Verificar que el loader carga un MFE desde el import map

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

- [ ] Importar `loadMFE` en `app-shell.ts`
- [ ] Implementar `connectedCallback` que carga el MFE al montar
- [ ] Implementar `disconnectedCallback` que descarga el MFE
- [ ] Verificar que el shell carga el MFE desde `localhost:5174`
- [ ] Verificar que el MFE recibe el context (locale, theme)
- [ ] Verificar que no hay errores en consola

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

- [ ] Instalar `concurrently` como dependencia de desarrollo
- [ ] Crear script `dev` en `package.json` raíz
- [ ] Configurar scripts individuales en cada paquete
- [ ] Verificar que `pnpm dev` arranca todos los servidores

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

- [ ] Arrancar todos los dev servers (`pnpm dev`)
- [ ] Abrir shell en el navegador
- [ ] Verificar en Network tab que se cargan los archivos del MFE
- [ ] Verificar en Elements tab que el custom element se registra
- [ ] Verificar que el MFE renderiza contenido
- [ ] Verificar que el MFE recibe atributos del shell
- [ ] Navegar away y verificar que el MFE se desmonta
- [ ] Verificar que no hay memory leaks (listeners limpiados)
- [ ] Documentar resultado en el ticket

### Criterio de verificación

- [ ] El MFE se carga via `import()` desde el import map
- [ ] El custom element `<mfe-dashboard>` aparece en el DOM
- [ ] El MFE renderiza contenido visible
- [ ] No hay errores en la consola del navegador
- [ ] Al desmontar, el MFE se remueve del DOM limpiamente

---

## Resumen de esfuerzo

| Ticket | Horas | Dependencias |
|--------|-------|--------------|
| T-01 | 3h | — |
| T-02 | 4h | T-01 |
| T-03 | 4h | T-01 |
| T-04 | 6h | T-02, T-03 |
| T-05 | 3h | T-04 |
| T-06 | 5h | T-01 |
| T-07 | 5h | T-02, T-06 |
| T-08 | 4h | T-05, T-06, T-07 |
| T-09 | 2h | T-08 |
| T-10 | 3h | T-09 |
| **Total** | **39h** | |

### Camino crítico

```
T-01 → T-02 → T-04 → T-05 → T-08 → T-09 → T-10
T-01 → T-06 → T-07 ↗
```

**Duración camino crítico:** 39 horas (todos los tickets son necesarios)
