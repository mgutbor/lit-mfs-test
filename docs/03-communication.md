# Comunicación entre MFEs

El proyecto utiliza dos canales con responsabilidades distintas:

1. **CustomEvents DOM:** eventos emitidos por un custom element y capturados por el shell o por un ancestro.
2. **Event bus compartido:** broadcasts desacoplados entre shell y MFEs, expuestos mediante `publish` y `subscribe` en `MfeContext`.

No existen imports directos entre MFEs.

## Contrato de entrada

El shell monta cada MFE con `loadMFE(container, context)`. El contexto real es:

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

El MFE debe conservar las funciones de cleanup devueltas por `subscribe` y ejecutarlas al desconectarse.

## CustomEvents DOM

Un MFE usa CustomEvents para notificar interacciones propias del componente. El evento se emite desde el custom element y, cuando debe atravesar Shadow DOM, incluye `bubbles` y `composed`:

```ts
this.dispatchEvent(new CustomEvent('mfe-settings:theme-changed', {
  detail: { theme: 'dark' },
  bubbles: true,
  composed: true,
}));
```

El shell escucha el evento en el flujo de la aplicación, valida el payload y lo traduce al broadcast global:

```ts
const unsubscribe = eventBus.subscribe('mfe-settings:theme-changed', (data) => {
  if (!validateEvent('mfe-settings:theme-changed', data)) return;
  eventBus.publish('shell:theme-changed', data);
});
```

La validación runtime es necesaria aunque TypeScript conozca el tipo, porque los CustomEvents pueden proceder de código cargado dinámicamente.

## Event bus

La implementación de `createEventBus()` usa `document.dispatchEvent(new CustomEvent(topic, { detail }))` y `document.addEventListener(topic, listener)`. La suscripción devuelve una función para eliminar exactamente ese listener.

```ts
const eventBus = createEventBus();

const unsubscribe = eventBus.subscribe('shell:theme-changed', ({ theme }) => {
  element.theme = theme;
});

eventBus.publish('shell:theme-changed', { theme: 'dark' });
unsubscribe();
```

### Topics conocidos

Los topics y sus payloads se definen en `EventMap` de `packages/shared/src/types.ts`:

| Topic | Payload | Uso |
|---|---|---|
| `mfe-dashboard:order-selected` | `{ orderId: number; total?: number; currency?: string }` | Selección en Dashboard |
| `mfe-dashboard:filter-changed` | `{ filters: Record<string, unknown> }` | Cambio de filtros |
| `mfe-settings:theme-changed` | `{ theme: 'light' \| 'dark' }` | Petición de cambio de tema |
| `mfe-settings:locale-changed` | `{ locale: string }` | Cambio de locale |
| `mfe-settings:profile-updated` | `{ userId: string }` | Perfil actualizado |
| `shell:theme-changed` | `{ theme: 'light' \| 'dark' }` | Tema global propagado por shell |
| `shell:locale-changed` | `{ locale: string }` | Locale global |
| `shell:user-logged-out` | `{}` | Cierre de sesión |

Los topics no incluidos en `EventMap` continúan permitidos para compatibilidad con MFEs dinámicos, pero su payload se recibe como `unknown`. Antes de usarlo hay que validarlo:

```ts
context.subscribe('custom:event', (payload) => {
  if (typeof payload === 'object' && payload !== null && 'value' in payload) {
    console.log(payload.value);
  }
});
```

## Theming

El flujo actual es:

```text
1. Settings cambia la propiedad theme y emite mfe-settings:theme-changed.
2. El shell valida el payload.
3. El shell actualiza sus tokens y el MFE montado.
4. El shell publica shell:theme-changed mediante el event bus.
5. Los MFEs suscritos actualizan su estado y tokens.
6. Settings persiste la preferencia con el namespace mfe-settings:theme.
```

El payload solo admite `light` y `dark`. `auto` no forma parte del contrato actual.

## Cleanup y límites

- Cada `subscribe` debe tener un `unsubscribe` asociado.
- El shell mantiene una única instancia del event bus para la página.
- El bus tiene alcance de documento; no es un transporte entre pestañas, ventanas, iframes o procesos.
- El bus no valida automáticamente los payloads. La validación de eventos externos o dinámicos corresponde al consumidor.
- Para navegación, los MFEs deben usar `context.onNavigate(path)`; el shell mantiene el control de `history` y `popstate`.

## Evolución del contrato

Añadir un topic requiere documentar su nombre y payload y, si se quiere tipado estático, incorporarlo a `EventMap`. Cambiar o eliminar un payload conocido es un cambio incompatible y debe coordinarse con todos los consumidores.
