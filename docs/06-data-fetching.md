# Consumo de datos vía API

El shell carga y valida `config-map.json`; cada MFE recibe únicamente su `MfeConfig` mediante `MfeContext.config`. Las peticiones se realizan con el API client compartido de `@lit-mf/shared`.

## Contrato del config map

```ts
interface ConfigMap {
  version: string;
  baseUrl: string;
  'mfe-dashboard'?: MfeConfig;
  'mfe-settings'?: MfeConfig;
}

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

Ejemplo real del proyecto:

```json
{
  "version": "1.0.0",
  "baseUrl": "",
  "mfe-dashboard": {
    "name": "mfe-dashboard",
    "baseUrl": "https://dummyjson.com",
    "endpoints": {
      "orders": { "endpoint": "/todos", "method": "GET", "timeout": 5000 },
      "analytics": { "endpoint": "/posts", "method": "GET", "timeout": 10000 }
    }
  }
}
```

Cada MFE debe recibir una configuración con `name`, `baseUrl` y `endpoints`. Los endpoints son rutas relativas a `baseUrl`; el validador del shell rechaza URLs absolutas, métodos no permitidos, timeouts fuera de `1..60000` ms y orígenes no autorizados.

## Carga y validación

En desarrollo se sirve `packages/shell/public/config-map.json`. El shell hace `fetch('/config-map.json')`, valida la respuesta con `validateConfigMap()` y aplica un fallback vacío si falla la carga o la validación. Una configuración inválida no se mezcla parcialmente con una válida.

La allowlist actual incluye `https://dummyjson.com`. La allowlist de producción debe definirse como parte de la configuración del deployment; no se debe ampliar para aceptar cualquier origen.

## API client compartido

```ts
import { createApiClient } from '@lit-mf/shared';

const client = createApiClient(this.context.config);
const payload = await client.request<TodosResponse>(
  this.context.config.endpoints.orders,
  { signal },
);
```

`createApiClient` centraliza:

- resolución de `baseUrl` y endpoint;
- sustitución de parámetros `:param` y query params;
- método y headers, incluyendo `Accept: application/json`;
- timeout definido por `EndpointConfig.timeout`;
- cancelación mediante `AbortSignal`;
- parseo JSON y respuesta `204`;
- normalización de errores.

Los adapters del MFE siguen siendo responsables de transformar el formato de la API externa. Por ejemplo, Dashboard transforma `{ todos: [...] }` a su modelo `Todo` y `{ posts: [...] }` a `Post`; el API client no conoce esos formatos.

## Errores normalizados

Los errores se exponen como `ApiClientError`:

| Código | Significado |
|---|---|
| `HTTP_ERROR` | La respuesta tiene un status fuera de `2xx` |
| `NETWORK_ERROR` | Fallo de red o transporte no causado por abort/timeout |
| `TIMEOUT` | El timeout del endpoint abortó la petición |
| `ABORTED` | El consumidor canceló mediante `AbortSignal` |

```ts
try {
  const data = await client.request<Data>(endpoint, { signal });
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(error.code, error.status, error.url);
  }
}
```

Los componentes deben mostrar un estado de error controlado y ofrecer retry cuando proceda. No deben exponer tokens, headers sensibles ni detalles internos al usuario.

## Integración con `@lit/task`

`@lit/task` proporciona el `AbortSignal` de la ejecución actual. El client lo combina con su timeout, por lo que una ejecución obsoleta se cancela cuando cambian sus argumentos o cuando el componente se desconecta:

```ts
private todosTask = new Task(this, {
  task: async (_, { signal }) => {
    const config = this.context?.config;
    if (!config) throw new Error('Dashboard configuration is not available');

    const payload = await createApiClient(config).request<TodosResponse>(
      config.endpoints.orders,
      { signal },
    );

    return payload.todos;
  },
  args: () => [this.context?.config?.baseUrl ?? ''],
});
```

La task debe ignorar o representar correctamente los estados `pending`, `complete` y `error`. No se debe lanzar un `fetch` paralelo fuera del ciclo de vida del componente sin un `AbortSignal`.

## Parámetros de ruta y query

```ts
const payload = await client.request<Order>(
  {
    endpoint: '/orders/:id',
    method: 'GET',
    timeout: 3000,
  },
  {
    params: { id: 42, include: 'items' },
  },
);
```

El resultado es una URL equivalente a `/orders/42?include=items`. Los parámetros de ruta se codifican con `encodeURIComponent`; los valores `undefined` no se incluyen en la query.

## Compatibilidad y seguridad

- El client requiere `fetch`, `AbortController`, `URL` y `URLSearchParams`.
- La validación de origen pertenece al shell, que es el límite de confianza. El client no debe recibir una configuración no validada desde una fuente remota.
- Los endpoints relativos evitan que una entrada del config map sustituya arbitrariamente el origen permitido.
- No se implementa caching propio. Las políticas de caché deben venir del servidor o añadirse explícitamente como una capacidad posterior.
