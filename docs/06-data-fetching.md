# Consumo de datos via API

Configuración centralizada de endpoints, fetch con `@lit/task`, y manejo de loading/error states en MFEs.

## Config Map (`config-map.json`)

Todas las URLs de los endpoints de API se centralizan en un único fichero JSON. Los MFEs no hardcodean URLs; las reciben del shell via `mount(context)`.

### Estructura

```json
{
  "version": "1.0.0",
  "baseUrl": "https://api.example.com",
  "mfe-dashboard": {
    "orders": {
      "endpoint": "/v1/orders",
      "method": "GET",
      "timeout": 5000
    },
    "order-detail": {
      "endpoint": "/v1/orders/:id",
      "method": "GET",
      "timeout": 3000
    },
    "analytics": {
      "endpoint": "/v1/analytics/dashboard",
      "method": "GET",
      "timeout": 10000
    }
  },
  "mfe-settings": {
    "profile": {
      "endpoint": "/v1/user/profile",
      "method": "GET",
      "timeout": 3000
    },
    "update-profile": {
      "endpoint": "/v1/user/profile",
      "method": "PUT",
      "timeout": 5000
    }
  }
}
```

### Convenciones

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `version` | `string` | Versión semántica del config map |
| `baseUrl` | `string` | Base URL de la API (se antepone a todos los endpoints) |
| `mfe-{name}` | `object` | Sección de endpoints para un MFE específico |
| `{endpoint-name}.endpoint` | `string` | Ruta del endpoint (relativa a baseUrl) |
| `{endpoint-name}.method` | `string` | Método HTTP |
| `{endpoint-name}.timeout` | `number` | Timeout en milisegundos |
| `{endpoint-name}.headers` | `object` | Headers por defecto (opcional) |

### Parámetros en URLs

Los parámetros de ruta se definen con `:param`:

```json
{
  "endpoint": "/v1/orders/:id/items/:itemId",
  "method": "GET"
}
```

El MFE reemplaza los parámetros al hacer fetch:

```ts
function buildUrl(template: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (url, [key, value]) => url.replace(`:${key}`, value),
    template
  );
}

// buildUrl('/v1/orders/:id', { id: '42' }) → '/v1/orders/42'
```

### Carga del config map

**Desarrollo:** Fichero estático en `public/config-map.json`, servido por Vite.

**Producción:** Opciones:

1. **Estático versionado:** Se publica con el build del shell. Para actualizar, se despliega una nueva versión del shell.

2. **Vía API (recomendado para actualizaciones sin rebuild):**

```ts
// Shell carga el config map al arrancar
async function loadConfigMap(): Promise<ConfigMap> {
  const response = await fetch('/api/config-map', {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to load config map');
  return response.json();
}
```

El endpoint `/api/config-map` puede devolver diferente configuración según el entorno (dev, staging, production).

---

## Inyección de la config en los MFEs

El shell carga el config map y pasa **solo la sección del MFE** en el context:

```ts
// shell/src/app-shell.ts
const configMap = await loadConfigMap();

// Al montar cada MFE, pasar solo su porción de config
const dashboardContext: MfeContext = {
  locale: 'es',
  theme: 'dark',
  user: { id: '1', name: 'Ana', email: 'ana@example.com', roles: ['admin'] },
  eventBus,
  config: configMap['mfe-dashboard'],
};

mountMFE(dashboardContainer, '@lit-mf/dashboard', dashboardContext);
```

**Por qué no cada MFE carga su propia config:**
- El shell es el único que conoce el config map completo
- Los MFEs no necesitan saber la estructura global
- Menos requests HTTP (una sola carga en el shell)
- Control centralizado de la config

---

## `@lit/task` para fetch de datos

### Qué es

`@lit/task` es un reactive controller que maneja el ciclo de vida de operaciones asíncronas (fetch) con 4 estados:

| Estado | Constante | Descripción |
|--------|-----------|-------------|
| Inicial | `TaskStatus.INITIAL` | No se ha ejecutado ninguna tarea aún |
| Pendiente | `TaskStatus.PENDING` | La función async está en ejecución |
| Completo | `TaskStatus.COMPLETE` | La última ejecución resolvió correctamente |
| Error | `TaskStatus.ERROR` | La última ejecución falló |

### Por qué usarlo

- **AbortSignal automático:** Cancela requests obsoletos cuando cambian los argumentos
- **Race conditions manejadas:** Si el usuario cambia `userId` rápido, solo muestra el último resultado
- **Sin boilerplate:** No hay que gestionar flags `isLoading`, `hasError`, etc.
- **Render declarativo:** `task.render()` selecciona la plantilla según el estado

### Ejemplo básico

```ts
import { Task } from '@lit/task';

@customElement('user-profile')
class UserProfile extends LitElement {
  @property() userId = '';

  private _userTask = new Task(this, {
    task: async ([userId], { signal }) => {
      const response = await fetch(`/api/users/${userId}`, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    args: () => [this.userId],
  });

  render() {
    return this._userTask.render({
      initial: () => html`<p>Selecciona un usuario</p>`,
      pending: () => html`<p>Cargando...</p>`,
      complete: (user) => html`<h2>${user.name}</h2>`,
      error: (e) => html`<p>Error: ${e.message}</p>`,
    });
  }
}
```

### Auto-run vs Manual

| `autoRun` | Comportamiento |
|-----------|----------------|
| `true` (default) | Se ejecuta automáticamente cuando cambian los `args` |
| `'afterUpdate'` | Se ejecuta después de `updated()` (útil si necesitas leer el DOM) |
| `false` | Solo se ejecuta cuando llamas a `task.run()` manualmente |

**Ejemplo manual (fetch bajo demanda):**

```ts
private _searchTask = new Task(this, {
  task: async ([query], { signal }) => {
    const response = await fetch(`/api/search?q=${query}`, { signal });
    return response.json();
  },
  args: () => [this.query],
  autoRun: false,  // Solo ejecutar al hacer click en "Buscar"
});

render() {
  return html`
    <button @click=${() => this._searchTask.run()}>Buscar</button>
    ${this._searchTask.render({ /* ... */ })}
  `;
}
```

---

## Patrón de fetch con config-map

Combinación del config-map inyectado y `@lit/task`:

```ts
import { Task } from '@lit/task';

interface DashboardConfig {
  orders: { endpoint: string; timeout: number };
  analytics: { endpoint: string; timeout: number };
}

@customElement('mfe-dashboard')
class DashboardWidget extends LitElement {
  private context!: MfeContext;
  @property({ type: String }) dateRange = '7d';

  // Task que carga órdenes usando la URL del config-map
  private _ordersTask = new Task(this, {
    task: async ([dateRange], { signal }) => {
      const url = `${this.context.config.orders.endpoint}?range=${dateRange}`;
      const response = await fetch(url, {
        signal,
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    args: () => [this.dateRange],
  });

  // Task que carga analytics
  private _analyticsTask = new Task(this, {
    task: async ([dateRange], { signal }) => {
      const url = `${this.context.config.analytics.endpoint}?range=${dateRange}`;
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    args: () => [this.dateRange],
  });

  render() {
    return html`
      <section>
        <h2>Órdenes</h2>
        ${this._ordersTask.render({
          pending: () => html`<orders-skeleton />`,
          complete: (orders) => html`<orders-list .orders=${orders} />`,
          error: (e) => html`
            <error-message
              .error=${e}
              @retry=${() => this._ordersTask.run()}
            />
          `,
        })}
      </section>
      <section>
        <h2>Analytics</h2>
        ${this._analyticsTask.render({
          pending: () => html`<chart-skeleton />`,
          complete: (data) => html`<analytics-chart .data=${data} />`,
          error: (e) => html`
            <error-message
              .error=${e}
              @retry=${() => this._analyticsTask.run()}
            />
          `,
        })}
      </section>
    `;
  }
}
```

---

## Helper: construir URLs con parámetros

```ts
// shared/src/api.ts

/**
 * Reemplaza parámetros de ruta en una URL template.
 * buildUrl('/v1/orders/:id', { id: '42' }) → '/v1/orders/42'
 */
export function buildUrl(
  template: string,
  params: Record<string, string>
): string {
  return Object.entries(params).reduce(
    (url, [key, value]) => url.replace(new RegExp(`:${key}`, 'g'), value),
    template
  );
}

/**
 * Construye query string desde un objeto.
 * buildQueryString({ range: '7d', status: 'active' }) → 'range=7d&status=active'
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined
  );
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(
    entries.map(([key, value]) => [key, String(value)])
  ).toString();
}
```

**Uso:**

```ts
import { buildUrl, buildQueryString } from '@lit-mf/shared';

const baseUrl = this.context.config['order-detail'].endpoint;
// '/v1/orders/:id'

const url = buildUrl(baseUrl, { id: '42' });
// '/v1/orders/42'

const fullUrl = url + buildQueryString({ include: 'items', format: 'full' });
// '/v1/orders/42?include=items&format=full'
```

---

## Loading y Error states

### Loading states

**Skeleton screens** (mejor UX que spinners para contenido con estructura conocida):

```ts
@customElement('orders-skeleton')
class OrdersSkeleton extends LitElement {
  static styles = css`
    .skeleton { background: #e5e7eb; border-radius: 4px; }
    .row { display: flex; gap: 1rem; padding: 0.5rem 0; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; }
    .text { height: 16px; flex: 1; }
  `;

  render() {
    return html`
      ${Array.from({ length: 5 }, () => html`
        <div class="row">
          <div class="skeleton avatar"></div>
          <div class="skeleton text"></div>
        </div>
      `)}
    `;
  }
}
```

**Spinner simple** (para contenido de tamaño desconocido):

```ts
const pending = () => html`
  <div class="spinner" aria-label="Cargando datos"></div>
`;
```

### Error states

Componente de error reutilizable con retry:

```ts
@customElement('error-message')
class ErrorMessage extends LitElement {
  @property({ attribute: false }) error: Error = new Error('');

  render() {
    return html`
      <div class="error-container">
        <p class="error-text">
          No se pudieron cargar los datos: ${this.error.message}
        </p>
        <button @click=${() => this.dispatchEvent(new CustomEvent('retry'))}>
          Reintentar
        </button>
      </div>
    `;
  }
}
```

### Integración con `@lit/task`

```ts
this._ordersTask.render({
  initial: () => html`<p class="muted">Selecciona un rango de fechas</p>`,
  pending: () => html`<orders-skeleton />`,
  complete: (orders) => html`
    <orders-list .orders=${orders} />
  `,
  error: (e) => html`
    <error-message
      .error=${e instanceof Error ? e : new Error(String(e))}
      @retry=${() => this._ordersTask.run()}
    />
  `,
})
```

---

## API client compartido

Los MFEs deben usar `createApiClient()` para ejecutar peticiones configuradas en `MfeConfig`. El cliente centraliza URL, método, headers, timeout, cancelación y errores; los adapters del MFE siguen siendo responsables de normalizar el formato concreto de cada API externa.

```ts
import { createApiClient } from '@lit-mf/shared';

const client = createApiClient(this.context.config);
const payload = await client.request<TodosResponse>(
  this.context.config.endpoints.orders,
  { signal },
);
```

Los errores se exponen como `ApiClientError` con estos códigos:

| Código | Significado |
|--------|-------------|
| `HTTP_ERROR` | El servidor respondió con un status no exitoso |
| `NETWORK_ERROR` | Fallo de red o transporte |
| `TIMEOUT` | Se agotó el timeout definido en el endpoint |
| `ABORTED` | El consumidor canceló la petición mediante `AbortSignal` |

El cliente rechaza URLs de endpoint absolutas mediante la validación del `config-map`; los endpoints deben ser rutas relativas a `baseUrl`.

## Caching y performance

### HTTP Cache Headers

```
# Datos semi-estáticos (cambian pocas veces al día)
Cache-Control: private, max-age=300

# Datos en tiempo real (siempre validar)
Cache-Control: private, no-cache

# Datos estáticos (analytics pre-calculados)
Cache-Control: private, max-age=3600, immutable
```

### Fetch con cache del browser

```ts
// Usar cache del browser (default)
fetch(url, { cache: 'default' });

// Siempre ir al servidor (datos en tiempo real)
fetch(url, { cache: 'no-cache' });

// Usar cache sin validar (datos que no cambian)
fetch(url, { cache: 'force-cache' });
```

### Evitar refetch innecesario

`@lit/task` ya hace esto: solo re-ejecuta cuando cambian los `args`. Si `dateRange` no cambia, no se vuelve a hacer fetch.

### Preloading (opcional)

```ts
connectedCallback() {
  super.connectedCallback();
  // Preload analytics mientras el usuario ve orders
  this._analyticsTask.run();
}
```

---

## Ejemplo completo: MFE Dashboard

### Config-map

```json
{
  "mfe-dashboard": {
    "orders": {
      "endpoint": "/v1/orders",
      "method": "GET",
      "timeout": 5000
    },
    "analytics": {
      "endpoint": "/v1/analytics/dashboard",
      "method": "GET",
      "timeout": 10000
    }
  }
}
```

### Dashboard widget

```ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import { buildQueryString } from '@lit-mf/shared';

@customElement('mfe-dashboard')
class DashboardWidget extends LitElement {
  @property({ type: String }) dateRange = '7d';

  private context!: MfeContext;

  private _ordersTask = new Task(this, {
    task: async ([dateRange], { signal }) => {
      const endpoint = this.context.config.orders.endpoint;
      const qs = buildQueryString({ range: dateRange });
      const response = await fetch(`${endpoint}${qs}`, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<Order[]>;
    },
    args: () => [this.dateRange],
  });

  private _analyticsTask = new Task(this, {
    task: async ([dateRange], { signal }) => {
      const endpoint = this.context.config.analytics.endpoint;
      const qs = buildQueryString({ range: dateRange });
      const response = await fetch(`${endpoint}${qs}`, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<Analytics>;
    },
    args: () => [this.dateRange],
  });

  render() {
    return html`
      <header>
        <h1>Dashboard</h1>
        <date-range-picker
          .value=${this.dateRange}
          @change=${(e: CustomEvent) => this.dateRange = e.detail.value}
        />
      </header>

      <section class="orders-section">
        <h2>Órdenes recientes</h2>
        ${this._ordersTask.render({
          pending: () => html`<orders-skeleton />`,
          complete: (orders) => html`
            <orders-list .orders=${orders} />
          `,
          error: (e) => html`
            <error-message
              .error=${e instanceof Error ? e : new Error(String(e))}
              @retry=${() => this._ordersTask.run()}
            />
          `,
        })}
      </section>

      <section class="analytics-section">
        <h2>Analytics</h2>
        ${this._analyticsTask.render({
          pending: () => html`<chart-skeleton />`,
          complete: (data) => html`
            <analytics-chart .data=${data} />
          `,
          error: (e) => html`
            <error-message
              .error=${e instanceof Error ? e : new Error(String(e))}
              @retry=${() => this._analyticsTask.run()}
            />
          `,
        })}
      </section>
    `;
  }
}
```

### Flujo completo

```
1. Shell carga config-map.json al arrancar
2. Shell monta mfe-dashboard con mount(container, context)
   context.config = configMap['mfe-dashboard']
3. Dashboard recibe la config con las URLs de los endpoints
4. Task se ejecuta automáticamente (autoRun: true)
   args: [dateRange] → '/v1/orders?range=7d'
5. Mientras fetch está en curso → renderiza <orders-skeleton />
6. Fetch resuelve → renderiza <orders-list .orders=${orders} />
7. Si fetch falla → renderiza <error-message @retry=${...} />
8. Usuario cambia dateRange → Task re-ejecuta con nuevo arg
   AbortSignal cancela el fetch anterior
9. Nuevo fetch → nuevo render con los datos actualizados
```
