# Lit Microfrontends con Import Maps

Arquitectura de microfrontends basada en Lit 3 y Import Maps nativos del navegador. Composition en runtime sin vendor lock-in de bundlers.

## Stack tecnológico

- **Lit 3** — Web Components con reactividad, templates declarativos y Shadow DOM
- **Import Maps** — HTML spec nativo para resolución de módulos en runtime
- **Vite** — Library mode para generar ESM bundles de cada MFE
- **URLPattern** — API nativa del navegador para matching de rutas
- **pnpm workspaces** — Gestión del monorepo

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
| [01-architecture.md](./01-architecture.md) | Estructura del monorepo, Vite library mode, import maps, gestión de versiones |
| [02-mfe-contract.md](./02-mfe-contract.md) | Contract de cada MFE: mount/unmount, atributos, eventos, tipos |
| [03-communication.md](./03-communication.md) | Comunicación MFE ↔ Host y entre MFEs |
| [04-routing.md](./04-routing.md) | Routing del shell y routing interno de MFEs |
| [05-security.md](./05-security.md) | Seguridad, CSP, aislamiento, validación |

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

## Producción

```bash
# Build de todos los paquetes
pnpm build

# Los MFEs se publican como ESM bundles estáticos
# El import map se sirve desde una API o se inyecta en el HTML
```
