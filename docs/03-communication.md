# Comunicación entre MFEs

Patrones de comunicación entre el shell y los MFEs, y entre MFEs.

## Visión general

```
Shell → MFE:    Atributos del custom element (config inicial)
                + event bus inyectado en mount(context)

MFE → Shell:    CustomEvent dispatchado en el propio elemento
                con naming {mfe-name}:{action}

MFE ↔ MFE:     Via event bus (shell:theme-changed, etc.)
                sin acoplamiento directo
```

**Principio:** No hay imports directos entre MFEs. Toda comunicación pasa por el DOM (CustomEvents) o por el event bus inyectado.

## Flujo Shell → MFE: Atributos

El shell pasa datos al MFE como atributos del custom element en el momento del mount:

```ts
// shell/src/mfe-loader.ts
async function loadMFE(mfeName: string, container: HTMLElement, context: MfeContext) {
  const { mount } = await import(mfeName);
  
  const el = document.createElement(mfeName.replace('@lit-mf/', 'mfe-'));
  
  // Configuración vía atributos
  el.setAttribute('locale', context.locale);
  el.setAttribute('theme', context.theme);
  el.setAttribute('user-id', context.user.id);
  
  container.appendChild(el);
  
  return mount(el, context);
}
```

### El MFE recibe los atributos

```ts
@customElement('mfe-dashboard')
class DashboardWidget extends LitElement {
  @property({ type: String, reflect: true })
  locale = 'en';

  @property({ type: String, reflect: true })
  theme: 'light' | 'dark' | 'auto' = 'light';

  @property({ type: String, reflect: true })
  userId = '';

  updated(changed: Map<string, unknown>) {
    if (changed.has('locale')) {
      this.loadTranslations(this.locale);
    }
    if (changed.has('theme')) {
      this.applyTheme(this.theme);
    }
  }
}
```

## Flujo MFE → Shell: CustomEvents

Los MFEs emiten eventos usando `CustomEvent` dispatchado **en el propio elemento**, no en `window` o `document`.

### Emisión (MFE)

```ts
// mfe-dashboard/src/dashboard-widget.ts
class DashboardWidget extends LitElement {
  private handleOrderSelect(order: Order) {
    this.dispatchEvent(new CustomEvent('mfe-dashboard:order-selected', {
      detail: {
        orderId: order.id,
        total: order.total,
        currency: order.currency,
      },
      bubbles: true,    // Permite que burbujee hacia el shell
      composed: true,   // Permite cruzar Shadow DOM boundaries
    }));
  }
}
```

### Escucha (Shell)

```ts
// shell/src/mfe-loader.ts
function mountMFE(container: HTMLElement, mfeName: string) {
  const el = document.createElement(mfeName);
  container.appendChild(el);

  // Escuchar eventos del MFE
  container.addEventListener('mfe-dashboard:order-selected', (e) => {
    const { orderId, total } = e.detail;
    console.log(`Order selected: ${orderId}, total: ${total}`);
    
    // Shell puede reaccionar: navegar, mostrar notificación, etc.
    navigateTo(`/orders/${orderId}`);
  });

  container.addEventListener('mfe-settings:theme-changed', (e) => {
    const { theme } = e.detail;
    // Shell propaga el cambio a todos los MFEs
    document.querySelectorAll('[data-mfe]').forEach((mfe) => {
      mfe.setAttribute('theme', theme);
    });
  });
}
```

### Naming convention

| Evento | Significado |
|--------|-------------|
| `mfe-dashboard:order-selected` | Dashboard emite: usuario seleccionó un pedido |
| `mfe-dashboard:filter-changed` | Dashboard emite: filtros cambiaron |
| `mfe-settings:theme-changed` | Settings emite: usuario cambió el tema |
| `mfe-settings:locale-changed` | Settings emite: usuario cambió el idioma |
| `shell:theme-changed` | Shell emite: tema global cambió |
| `shell:user-logged-out` | Shell emite: usuario cerró sesión |

**Regla:** Nunca nombres genéricos como `click`, `change` o `update`. Siempre `{emisor}:{acción}`.

## Event Bus

Para comunicación bidireccional y eventos broadcast que afectan a múltiples MFEs, se usa un event bus inyectado en `mount(context)`.

### Implementación

```ts
// shared/src/event-bus.ts
export function createEventBus(): EventBus {
  return {
    on(event: string, handler: EventListenerOrEventListenerObject) {
      document.addEventListener(event, handler);
    },
    off(event: string, handler: EventListenerOrEventListenerObject) {
      document.removeEventListener(event, handler);
    },
    emit(event: string, detail?: unknown) {
      document.dispatchEvent(new CustomEvent(event, {
        detail,
        bubbles: true,
        composed: true,
      }));
    },
  };
}
```

### Inyección desde el shell

```ts
// shell/src/app-shell.ts
import { createEventBus } from '@lit-mf/shared';

const eventBus = createEventBus();

// Se inyecta en cada MFE via mount(context)
const context: MfeContext = {
  locale: 'es',
  theme: 'dark',
  user: { id: '1', name: 'Ana', email: 'ana@example.com', roles: ['admin'] },
  eventBus,
};

mountMFE(dashboardContainer, '@lit-mf/dashboard', context);
mountMFE(settingsContainer, '@lit-mf/settings', context);
```

### Uso en los MFEs

```ts
// mfe-dashboard/src/dashboard-widget.ts
class DashboardWidget extends LitElement {
  private unsubscribeFns: (() => void)[] = [];

  connectedCallback() {
    super.connectedCallback();
    
    // Escuchar cambios de tema del shell
    this.context.eventBus.on('shell:theme-changed', ((e: CustomEvent) => {
      this.theme = e.detail.theme;
    }) as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Limpiar suscripciones
  }
}
```

### Patrones de uso

#### Broadcast de datos compartidos

```ts
// Shell notifica cambio de tema a todos los MFEs
context.eventBus.emit('shell:theme-changed', { theme: 'dark' });

// Shell notifica cambio de idioma
context.eventBus.emit('shell:locale-changed', { locale: 'ca' });

// Shell notifica logout
context.eventBus.emit('shell:user-logged-out', {});
```

#### Comunicación MFE ↔ MFE (vía event bus)

```ts
// mfe-dashboard emite: usuario seleccionó un item
context.eventBus.emit('mfe-dashboard:item-selected', { itemId: 42 });

// mfe-settings escucha y reacciona
context.eventBus.on('mfe-dashboard:item-selected', ((e: CustomEvent) => {
  console.log('Item selected in dashboard:', e.detail.itemId);
}) as EventListener);
```

**Nota:** Aunque el event bus usa `document.addEventListener`, la comunicación entre MFEs no crea acoplamiento directo: el emisor no sabe quién escucha, y el escuchante no sabe quién emite. Solo comparten el contrato del nombre del evento y el shape del `detail`.

## Datos reactivos

Para datos que cambian en runtime y afectan a múltiples MFEs (theme, locale, user), hay dos mecanismos:

### 1. Atributos reactivos (recomendado para config inicial)

El shell actualiza los atributos del custom element cuando cambian los datos:

```ts
// Shell actualiza el tema en todos los MFEs
function updateTheme(theme: string) {
  document.querySelectorAll('[data-mfe]').forEach((mfe) => {
    mfe.setAttribute('theme', theme);
  });
  
  // También emite evento para MFEs que lo necesiten
  context.eventBus.emit('shell:theme-changed', { theme });
}
```

### 2. Event bus (recomendado para datos en tiempo real)

Para datos que cambian frecuentemente o que requieren reacción inmediata:

```ts
// Shell emite cambio de tema
context.eventBus.emit('shell:theme-changed', { theme: 'dark' });

// Cada MFE escucha y actualiza su estado interno
class DashboardWidget extends LitElement {
  connectedCallback() {
    this.context.eventBus.on('shell:theme-changed', ((e: CustomEvent) => {
      this.theme = e.detail.theme;
    }) as EventListener);
  }
}
```

## Flujo completo de ejemplo

### Cambio de tema

```
1. Usuario hace click en "Cambiar tema" en mfe-settings
2. mfe-settings emite CustomEvent 'mfe-settings:theme-changed'
   detail: { theme: 'dark' }
3. Shell escucha el evento en el container de settings
4. Shell actualiza el atributo 'theme' en TODOS los MFEs
5. Shell emite 'shell:theme-changed' via event bus
6. Cada MFE recibe el evento y actualiza su render
7. Shell guarda la preferencia en localStorage
```

### Selección de pedido

```
1. Usuario hace click en un pedido en mfe-dashboard
2. mfe-dashboard emite CustomEvent 'mfe-dashboard:order-selected'
   detail: { orderId: 42, total: 89.99, currency: 'EUR' }
3. Shell escucha el evento en el container de dashboard
4. Shell navega a /orders/42 (via history.pushState)
5. Shell actualiza el atributo 'route' en mfe-dashboard
6. mfe-dashboard renderiza la vista de detalle del pedido
```

## Reglas

1. **No imports directos entre MFEs.** Un MFE nunca importa código de otro MFE.
2. **CustomEvents en el propio elemento.** No en `window` o `document`.
3. **Naming convention estricta.** `{mfe-name}:{action}`. Nunca genéricos.
4. **Event bus para broadcast.** Para datos compartidos que afectan a múltiples MFEs.
5. **Atributos para config inicial.** Para datos que se pasan en el mount.
6. **Limpiar suscripciones.** En `disconnectedCallback`, eliminar todos los listeners del event bus.
