# Arquitectura

Estructura del proyecto, configuración de Vite para library mode, import maps y gestión de versiones.

## Estructura del monorepo

```
lit-mfs-test/
├── packages/
│   ├── shell/                    # Host Lit 3
│   │   ├── src/
│   │   │   ├── app-shell.ts      # Custom element raíz
│   │   │   ├── router.ts         # Router basado en URLPattern
│   │   │   └── mfe-loader.ts     # Cargador dinámico de MFEs
│   │   ├── index.html            # HTML con import map inlineado
│   │   ├── vite.config.ts
│   │   └── package.json
│   ├── mfe-dashboard/            # MFE 1
│   │   ├── src/
│   │   │   ├── entry.ts          # mount() / unmount()
│   │   │   └── dashboard-widget.ts
│   │   ├── vite.config.ts
│   │   └── package.json
│   ├── mfe-settings/             # MFE 2
│   │   ├── src/
│   │   │   ├── entry.ts
│   │   │   └── settings-widget.ts
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── shared/                   # Paquete compartido
│       ├── src/
│       │   ├── tokens.ts         # Design tokens (CSS Custom Properties)
│       │   ├── context.ts        # Keys de @lit/context compartidos
│       │   ├── types.ts          # Tipos del contract MFE
│       │   └── event-bus.ts      # Event bus para comunicación
│       ├── vite.config.ts
│       └── package.json
├── package.json                  # Root (pnpm workspaces)
└── tsconfig.base.json
```

### Dependencias entre paquetes

```
shell ──────────► shared
mfe-dashboard ──► shared
mfe-settings ───► shared
```

`shared` es consumido por todos, pero se compila como ESM standalone y se resuelve via import map, no como dependencia npm directa en runtime.

## Vite library mode

Cada MFE se configura como library en Vite para generar un ESM bundle standalone.

### Configuración típica de un MFE

```ts
// mfe-dashboard/vite.config.ts
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/entry.ts'),
      formats: ['es'],           // Solo ESM
      fileName: 'index',         // Produce index.js
    },
    rollupOptions: {
      external: [
        'lit',
        'lit/',
        '@lit/context',
        '@lit/task',
        '@lit-mf/shared',
      ],
    },
    target: 'es2022',
    modulePreload: { polyfill: false },
  },
});
```

### Opciones clave

| Opción | Valor | Por qué |
|--------|-------|----------|
| `build.lib.formats` | `['es']` | Import maps solo funcionan con ESM nativo. No se necesita UMD/CJS |
| `rollupOptions.external` | Array de bare specifiers | Cada dependencia en el import map debe externalizarse para que el browser la resuelva via import map |
| `build.target` | `'es2022'` | Alineado con navegadores que soportan import maps (Chrome 89+, Firefox 108+, Safari 16.4+) |
| `modulePreload.polyfill` | `false` | El polyfill de modulepreload no aplica en library mode |

### Output resultante

Un archivo ESM (`index.js`) con imports bare que el browser resuelve via import map:

```js
// Output de mfe-dashboard (simplificado)
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

class DashboardWidget extends LitElement { /* ... */ }

function mount(container, context) {
  const el = document.createElement('mfe-dashboard');
  container.appendChild(el);
  return () => el.remove();
}

export { mount };
```

## Import Map

### Desarrollo (inline en HTML)

```html
<!-- shell/index.html -->
<script type="importmap">
{
  "imports": {
    "lit": "https://cdn.jsdelivr.net/npm/lit@3.3.0/index.js",
    "lit/": "https://cdn.jsdelivr.net/npm/lit@3.3.0/",
    "@lit/context": "https://cdn.jsdelivr.net/npm/@lit/context@1.1.3/index.js",
    "@lit/context/": "https://cdn.jsdelivr.net/npm/@lit/context@1.1.3/",
    "@lit-mf/shared": "http://localhost:5173/shared/index.js",
    "@lit-mf/dashboard": "http://localhost:5174/index.js",
    "@lit-mf/settings": "http://localhost:5175/index.js"
  }
}
</script>
```

**Regla crítica:** El `<script type="importmap">` debe aparecer antes de cualquier `<script type="module">` en el documento. El browser rechaza import maps si ya se ha iniciado la resolución de módulos.

### Producción (vía API)

En producción, el import map se sirve desde una API que permite actualizar versiones sin rebuild del shell:

```ts
// shell/src/load-import-map.ts
async function loadImportMap() {
  const response = await fetch('/api/import-map');
  const mapData = await response.json();
  
  const script = document.createElement('script');
  script.type = 'importmap';
  script.textContent = JSON.stringify(mapData);
  document.head.prepend(script);
}

await loadImportMap();
```

### Formato del manifest de la API

```json
{
  "imports": {
    "lit": "https://cdn.jsdelivr.net/npm/lit@3.3.0/index.js",
    "lit/": "https://cdn.jsdelivr.net/npm/lit@3.3.0/",
    "@lit/context": "https://cdn.jsdelivr.net/npm/@lit/context@1.1.3/index.js",
    "@lit-mf/shared": "https://cdn.example.com/shared@1.0.0/index.js",
    "@lit-mf/dashboard": "https://cdn.example.com/mfe-dashboard@2.1.0/index.js",
    "@lit-mf/settings": "https://cdn.example.com/mfe-settings@1.5.0/index.js"
  }
}
```

Para actualizar un MFE: se modifica la URL en la respuesta de la API. No se necesita rebuild del shell.

## Soporte de browsers

| Browser | Import Maps (nativo) | URLPattern | Versión mínima |
|---------|---------------------|------------|----------------|
| Chrome/Edge | Completo | Completo | 89+ (import maps), 95+ (URLPattern) |
| Firefox | Completo (1 solo map) | Completo | 108+ (import maps), 119+ (URLPattern) |
| Safari | Completo | Completo | 16.4+ (import maps), 18.2+ (URLPattern) |
| Múltiples import maps | Chrome 133+, Safari 18.4+ | — | Firefox: pendiente |

**Cobertura global ( sept 2026):** ~95% para import maps, ~93% para URLPattern.

### Polyfills

- **`es-module-shims`** — Para múltiples import maps en Firefox y browsers anteriores. ~1.5KB gzipped.
- **URLPattern polyfill** — Algunos routers como LitroRouter ya incluyen fallback integrado.

## Dependencias compartidas via Import Map

Las dependencias compartidas (lit, lit-context, etc.) se mapean una sola vez en el import map. Todos los MFEs las externalizan en su build, garantizando una sola instancia en la página:

```
lit → https://cdn.jsdelivr.net/npm/lit@3.3.0/index.js
```

Para sub-path imports de Lit:

```json
{
  "imports": {
    "lit": "https://cdn.jsdelivr.net/npm/lit@3.3.0/index.js",
    "lit/": "https://cdn.jsdelivr.net/npm/lit@3.3.0/"
  }
}
```

Esto resuelve `import { html } from 'lit'` y `import { customElement } from 'lit/decorators.js'` a la misma versión.

## Gestión de versiones

### Estrategia de versioning

- **Dependencias compartidas (lit, lit-context):** Pinneadas a versión específica en el import map. Se actualizan de forma coordinada.
- **MFEs:** Cada MFE tiene su propio ciclo de versiones. Las URLs del import map apuntan a versión específica (no `@latest`).
- **shared:** Versionado semántico. Breaking changes incrementan major version.

### Flujo de actualización de un MFE

1. El equipo del MFE desarrolla y testea la nueva versión
2. Se publica el ESM bundle con nueva versión (ej: `mfe-dashboard@2.2.0`)
3. Se actualiza la URL en el manifest de la API de import maps
4. Los usuarios recién cargan la nueva versión en su próxima visita (sin rebuild del shell)

### Rollback

Si una versión tiene problemas, se revierte la URL en el manifest de import maps. Los usuarios obtienen la versión anterior en la siguiente carga de página.
