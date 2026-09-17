# Lit Microfrontends con Import Maps

Arquitectura de microfrontends basada en Lit 3 y Import Maps nativos del navegador. Composition en runtime sin vendor lock-in de bundlers.

## Stack tecnológico

- **Lit 3** — Web Components con reactividad, templates declarativos y Shadow DOM
- **Import Maps** — HTML spec nativo para resolución de módulos en runtime
- **Vite** — Library mode para generar ESM bundles de cada MFE
- **URLPattern** — API nativa del navegador para matching de rutas
- **pnpm workspaces** — Gestión del monorepo
- **Vitest** — Runner de tests y cobertura V8

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│                    Shell (Lit 3)                 │
│  Router → MFE Loader → Dynamic import() → Mount │
└────────┬──────────────────┬─────────────────────┘
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│  mfe-dashboard  │  │  mfe-settings   │
│  (ESM bundle)   │  │  (ESM bundle)   │
└─────────────────┘  └─────────────────┘
         │                  │
         ▼                  ▼
┌─────────────────────────────────────────────────┐
│              Import Map (navegador)              │
│  lit → cdn.jsdelivr.net/lit@3.3.0/index.js     │
│  @lit-mf/dashboard → localhost:5174/index.js    │
│  @lit-mf/settings  → localhost:5175/index.js    │
└─────────────────────────────────────────────────┘
```

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [01-architecture.md](./docs/01-architecture.md) | Estructura del monorepo, Vite library mode, import maps, gestión de versiones |
| [02-mfe-contract.md](./docs/02-mfe-contract.md) | Contract de cada MFE: mount/unmount, atributos, eventos, tipos |
| [03-communication.md](./docs/03-communication.md) | Comunicación MFE ↔ Host y entre MFEs |
| [04-routing.md](./docs/04-routing.md) | Routing del shell y routing interno de MFEs |
| [05-security.md](./docs/05-security.md) | Seguridad, CSP, aislamiento, validación |
| [06-data-fetching.md](./docs/06-data-fetching.md) | Consumo de datos via API: config-map, @lit/task, loading/error states |
| [07-component-guidelines.md](./docs/07-component-guidelines.md) | Guía de arquitectura de componentes: MVVM, naming, estructura, eventos |
| [08-user-stories.md](./docs/08-user-stories.md) | User stories del proyecto (6 stories) |
| [09-backlog.md](./docs/09-backlog.md) | Product Backlog priorizado con MoSCoW |
| [10-tickets.md](./docs/10-tickets.md) | Work tickets para US-01 con estimación en horas |
| [11-implementation-plan.md](./docs/11-implementation-plan.md) | Plan de implementación por fases con cronograma |

## Desarrollo local

```bash
# Instalar dependencias
pnpm install

# Arrancar shell + todos los MFEs
pnpm dev

# O arrancar individualmente
pnpm --filter shell dev
pnpm --filter mfe-dashboard dev
pnpm --filter mfe-settings dev
```

Cada MFE corre en su propio puerto (shell: 5173, dashboard: 5174, settings: 5175). El import map del shell apunta a `localhost` en desarrollo.

## Tests

```bash
# Ejecutar tests una vez
pnpm test

# Ejecutar tests en modo watch
pnpm test:watch

# Ejecutar tests con cobertura V8
pnpm test:coverage

# Ejecutar smoke tests end-to-end en Chromium
pnpm test:e2e
```

Los tests unitarios se localizan en `tests/**/*.test.ts` y `packages/**/*.test.ts`. Los smoke tests end-to-end están en `e2e/` y arrancan los servidores de desarrollo automáticamente. El pipeline de CI ejecuta cobertura, smoke tests E2E y build mediante `.github/workflows/ci.yml`.

## Producción

```bash
# Build de todos los paquetes
pnpm build

# Los MFEs se publican como ESM bundles estáticos
# El import map se sirve desde una API o se inyecta en el HTML
```

## Seguridad

La Fase 4 de hardening incorpora:

- CSP en el shell, sin `unsafe-eval` ni `unsafe-inline` en `script-src`.
- `frame-ancestors 'none'` servido mediante header HTTP.
- Storage namespaced mediante `createNamespacedStorage()`; la preferencia de tema usa `mfe-settings:theme`.
- Validación del `detail` de los eventos procesados por el shell.
- Renderizado seguro de los mensajes de error del loader mediante `textContent`, sin interpolar datos en `innerHTML`.

La política de desarrollo está definida en `packages/shell/index.html` y `packages/shell/vite.config.ts`. En producción, el servidor debe generar el nonce por respuesta y servir la CSP completa como header HTTP.
