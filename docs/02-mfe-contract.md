# Contract de Microfrontend

API surface de cada MFE: firma de mount/unmount, tipos, atributos soportados y eventos emitidos.

## Firma del entry point

Cada MFE exporta desde su `entry.ts`:

```ts
// Contract estándar
export function mount(container: HTMLElement, context?: MfeContext): MfeUnmount;
export function unmount?(): void;

type MfeUnmount = () => void;
```

### `mount(container, context?)`

- **`container`**: Elemento DOM donde el MFE debe renderizarse. El MFE append su custom element como hijo de este container.
- **`context`**: Datos compartidos del shell (locale, theme, user, eventBus). Opcional para MFEs que no necesitan contexto.
- **Retorna**: Función de cleanup que el shell llama al desmontar el MFE.

### `unmount()` (opcional)

Limpieza explícita adicional. El shell siempre llama a la cleanup de `mount` primero; `unmount` solo se usa si hay recursos que liberar fuera del scope del container.

## MfeContext

```ts
interface MfeContext {
  /** Locale activo (ej: 'es', 'en', 'ca') */
  locale: string;
  
  /** Tema visual (ej: 'light', 'dark', 'auto') */
  theme: 'light' | 'dark' | 'auto';
  
  /** Datos del usuario autenticado */
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  };
  
  /** Event bus compartido para comunicación entre MFEs */
  eventBus: EventBus;
  
  /** Token de autenticación (solo para MFEs que lo necesiten) */
  authToken?: string;
}

interface EventBus {
  on(event: string, handler: EventListenerOrEventListenerObject): void;
  off(event: string, handler: EventListenerOrEventListenerObject): void;
  emit(event: string, detail?: unknown): void;
}
```

## Atributos del custom element

Cada MFE expone atributos HTML que el shell puede configurar. Atributos son strings; la serialización/deserialización es responsabilidad del MFE.

### Atributos comunes

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `locale` | `string` | Locale activo |
| `theme` | `'light' \| 'dark' \| 'auto'` | Tema visual |
| `user-id` | `string` | ID del usuario |
| `route` | `string` | Sub-ruta interna del MFE |
| `base-path` | `string` | Prefijo de ruta base |

### Atributos específicos del MFE

Cada MFE puede definir atributos adicionales. Ejemplo para `mfe-dashboard`:

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `dashboard-id` | `string` | ID del dashboard a mostrar |
| `date-range` | `string` | Rango de fechas (formato ISO) |

### Ejemplo de implementación en Lit

```ts
@customElement('mfe-dashboard')
class DashboardWidget extends LitElement {
  @property({ type: String, reflect: true })
  locale = 'en';

  @property({ type: String, reflect: true })
  theme: 'light' | 'dark' | 'auto' = 'light';

  @property({ type: String, reflect: true })
  userId = '';

  @property({ type: String, reflect: true })
  route = '/';

  @property({ type: String, reflect: true })
  basePath = '/dashboard';
}
```

`reflect: true` permite que el shell lea los atributos con `el.getAttribute()` y que los atributos se actualicen cuando cambian las propiedades.

## Eventos emitidos

### Naming convention

```
{mfe-name}:{action}
```

- Solo minúsculas, números, guiones y puntos
- Debe empezar con el nombre del MFE
- Debe contener al menos un nivel adicional después del nombre del MFE
- Formato: reverse domain name notation (simplificado)

### Ejemplos

| Evento | MFE | Descripción |
|--------|-----|-------------|
| `mfe-dashboard:order-selected` | dashboard | Usuario selecciona un pedido |
| `mfe-dashboard:filter-changed` | dashboard | Cambio de filtros |
| `mfe-settings:theme-changed` | settings | Cambio de tema |
| `mfe-settings:locale-changed` | settings | Cambio de idioma |
| `mfe-settings:profile-updated` | settings | Actualización de perfil |

### Formato del CustomEvent

```ts
// El evento DEBE dispatcharse en el propio elemento MFE
this.dispatchEvent(new CustomEvent('mfe-dashboard:order-selected', {
  detail: {
    orderId: 42,
    total: 89.99,
    currency: 'EUR',
  },
  bubbles: true,    // Permite que burbujee hacia el shell
  composed: true,   // Permite cruzar Shadow DOM boundaries
}));
```

### Schema de eventos

Cada MFE documenta sus eventos con JSON Schema:

```json
{
  "mfe-dashboard:order-selected": {
    "description": "Emitted when a user selects an order in the dashboard",
    "schema": {
      "type": "object",
      "required": ["orderId"],
      "properties": {
        "orderId": { "type": "integer", "description": "Unique order identifier" },
        "total": { "type": "number", "description": "Order total amount" },
        "currency": { "type": "string", "enum": ["EUR", "USD", "GBP"] }
      },
      "additionalProperties": false
    }
  }
}
```

## Storage namespaced

Si un MFE necesita persistir datos en localStorage o sessionStorage, DEBE namespaced:

```ts
// ❌ Mal - colisiona con otros MFEs y el shell
localStorage.setItem('user', JSON.stringify(user));

// ✅ Bien - namespace con el nombre del MFE
localStorage.setItem('mfe-dashboard:filters', JSON.stringify(filters));
```

### Formato del namespace

```
{mfe-name}:{key}
```

Ejemplos:
- `mfe-dashboard:filters`
- `mfe-dashboard:sort-preference`
- `mfe-settings:theme`

## Error handling

Si un MFE recibe configuración inválida o eventos erróneos:

1. **No debe crashear**. Renderiza un fallback o placeholder.
2. **Debe loguear** el error con contexto (qué atributo/evento falló).
3. **Debe emitir** un evento de error estandarizado:

```ts
this.dispatchEvent(new CustomEvent('mfe-dashboard:error', {
  detail: {
    code: 'INVALID_CONFIG',
    message: 'Missing required attribute: user-id',
    context: { attribute: 'user-id', received: null },
  },
  bubbles: true,
  composed: true,
}));
```

## Contracts en TypeScript

### shared/src/types.ts

```ts
// Tipos compartidos para todos los MFEs
export interface MfeContext {
  locale: string;
  theme: 'light' | 'dark' | 'auto';
  user: MfeUser;
  eventBus: EventBus;
  authToken?: string;
}

export interface MfeUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface EventBus {
  on(event: string, handler: EventListenerOrEventListenerObject): void;
  off(event: string, handler: EventListenerOrEventListenerObject): void;
  emit(event: string, detail?: unknown): void;
}

export type MfeUnmount = () => void;

export interface MfeModule {
  mount: (container: HTMLElement, context?: MfeContext) => MfeUnmount;
  unmount?: () => void;
}
```

### shared/src/event-types.ts

```ts
// Eventos emitidos por cada MFE
export interface DashboardEvents {
  'mfe-dashboard:order-selected': { orderId: number; total?: number; currency?: string };
  'mfe-dashboard:filter-changed': { filters: Record<string, unknown> };
}

export interface SettingsEvents {
  'mfe-settings:theme-changed': { theme: 'light' | 'dark' | 'auto' };
  'mfe-settings:locale-changed': { locale: string };
  'mfe-settings:profile-updated': { userId: string };
}

// Eventos emitidos por el shell
export interface ShellEvents {
  'shell:theme-changed': { theme: 'light' | 'dark' | 'auto' };
  'shell:locale-changed': { locale: string };
  'shell:user-logged-out': {};
}
```
