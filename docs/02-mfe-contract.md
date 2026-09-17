# Contrato de Microfrontend

Este documento describe el contrato público que comparten el shell y los MFEs. La fuente de verdad del contrato TypeScript es `packages/shared/src/types.ts`; los MFEs no deben duplicar estas interfaces.

## Entry point

Cada MFE expone un módulo ESM con una función `mount`:

```ts
import type { MfeContext } from '@lit-mf/shared';

export function mount(
  container: HTMLElement,
  context: MfeContext,
): (() => void) | { unmount: () => void };

// Opcional: export function unmount(): void;
```

- `container` es el elemento que el shell reserva para el MFE.
- `context` es obligatorio y contiene la configuración y las capacidades compartidas.
- `mount` debe añadir el contenido del MFE al container y devolver una función o un objeto `{ unmount }`.
- El shell ejecuta el cleanup devuelto al cambiar de ruta o al desmontar el MFE.
- `unmount` es opcional y solo representa una capacidad adicional del módulo; el loader usa el cleanup devuelto por `mount` como contrato principal.

El cleanup debe ser idempotente: ejecutarlo más de una vez no debe lanzar errores ni dejar listeners activos.

## `MfeContext`

```ts
interface MfeContext {
  locale: string;
  theme: 'light' | 'dark';
  route: string;
  container: HTMLElement;
  config: MfeConfig;
  onNavigate: (path: string) => void;
  publish: EventBus['publish'];
  subscribe: EventBus['subscribe'];
}
```

El shell construye el contexto completo al montar el MFE. `container` es añadido por `loadMFE`; los MFEs no deben sustituirlo ni montar fuera de él.

### Reglas del contexto

- `theme` solo admite `light` o `dark`; no existe el valor `auto` en el contrato actual.
- `route` contiene la ruta resuelta por el shell.
- `config` contiene la configuración del MFE, no el `ConfigMap` global completo.
- `onNavigate` es la única vía de navegación que deben usar los MFEs. El shell es el único dueño de `window.history`.
- `publish` y `subscribe` son las capacidades del event bus. No se inyecta una propiedad `eventBus` independiente.

## Configuración

```ts
interface MfeConfig {
  name: string;
  baseUrl: string;
  endpoints: Record<string, EndpointConfig>;
}

interface EndpointConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  timeout: number;
  headers?: Record<string, string>;
}
```

El shell valida el `config-map.json` antes de pasarlo al MFE. Los endpoints deben ser rutas relativas que empiezan por `/`; `baseUrl` debe ser un origen HTTP(S) permitido. Los MFEs deben usar `createApiClient(config)` en lugar de llamar directamente a `fetch`.

## Event bus

```ts
interface EventBus {
  publish: <Topic extends string>(
    topic: Topic,
    ...data: Topic extends keyof EventMap
      ? [data: EventMap[Topic]]
      : [data?: unknown]
  ) => void;

  subscribe: <Topic extends string>(
    topic: Topic,
    handler: (data: Topic extends keyof EventMap ? EventMap[Topic] : unknown) => void,
  ) => () => void;
}
```

Los topics incluidos en `EventMap` tienen payload tipado. Los topics no declarados siguen permitidos para facilitar extensiones dinámicas, pero su payload es `unknown` al consumirlo y debe validarse mediante narrowing o un validador runtime.

Eventos conocidos actualmente:

| Topic | Payload |
|---|---|
| `mfe-dashboard:order-selected` | `{ orderId: number; total?: number; currency?: string }` |
| `mfe-dashboard:filter-changed` | `{ filters: Record<string, unknown> }` |
| `mfe-settings:theme-changed` | `{ theme: 'light' \| 'dark' }` |
| `mfe-settings:locale-changed` | `{ locale: string }` |
| `mfe-settings:profile-updated` | `{ userId: string }` |
| `shell:theme-changed` | `{ theme: 'light' \| 'dark' }` |
| `shell:locale-changed` | `{ locale: string }` |
| `shell:user-logged-out` | `{}` |

El bus se implementa con `CustomEvent` sobre `document`. `subscribe` devuelve una función de cleanup que debe ejecutarse cuando el componente se desconecta.

```ts
const unsubscribe = context.subscribe('shell:theme-changed', ({ theme }) => {
  element.theme = theme;
});

// En disconnectedCallback:
unsubscribe();
```

La validación TypeScript no sustituye la validación runtime: el shell valida explícitamente el evento `mfe-settings:theme-changed` antes de propagar el cambio de tema.

## Custom elements y eventos DOM

Los eventos de interacción propios de un MFE se emiten desde su custom element con `bubbles: true` y `composed: true` cuando deban cruzar un Shadow DOM. El event bus es el mecanismo separado para broadcasts compartidos. No se deben confundir ambos canales.

Los MFEs actuales exponen principalmente las propiedades `locale`, `theme` y `route`. Los atributos adicionales solo forman parte del contrato cuando estén implementados en el componente correspondiente.

## Storage

Todo acceso persistente debe usar `createNamespacedStorage`:

```ts
const storage = createNamespacedStorage('mfe-settings');
storage.setItem('theme', 'dark'); // clave física: mfe-settings:theme
```

Un MFE no debe escribir claves globales que puedan colisionar con otros MFEs o con el shell.

## Compatibilidad y versionado

- El runtime requiere ESM, `CustomEvent`, `AbortController`, Shadow DOM y `URLPattern` nativo para el router actual.
- Los import maps se usan para resolver `lit`, `@lit/context`, `@lit-mf/shared` y los MFEs. La compatibilidad efectiva depende del navegador y del servidor que entrega los bundles.
- El proyecto no incorpora actualmente un polyfill de `URLPattern` ni un fallback de import maps; los navegadores objetivo deben soportar estas APIs o el deployment debe añadirlos explícitamente.
- Los cambios incompatibles en `MfeContext`, `EventMap`, `EndpointConfig` o `MfeModule` requieren coordinar shell, MFEs y `shared`. Deben tratarse como cambios major del contrato.
- Añadir un nuevo topic es compatible si se mantiene el fallback dinámico; para obtener tipado estático debe añadirse también a `EventMap`.
