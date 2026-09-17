import type { EndpointConfig, MfeConfig } from './types';

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface ApiRequestOptions {
  params?: QueryParams;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export type ApiErrorCode = 'HTTP_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'ABORTED';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode,
    public readonly url: string,
    public readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ApiClientError';
  }
}

export interface ApiClient {
  request<T>(endpoint: EndpointConfig, options?: ApiRequestOptions): Promise<T>;
}

export type FetchImplementation = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export function buildUrl(endpoint: EndpointConfig, params?: Record<string, string>): string {
  let url = endpoint.endpoint;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    }
  }

  const queryString = buildQueryString(params ?? {});
  if (queryString) {
    url += queryString;
  }

  return url;
}

export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

export function buildRequestUrl(
  baseUrl: string,
  endpoint: EndpointConfig,
  params: QueryParams = {},
): string {
  let path = endpoint.endpoint;
  const queryParams: QueryParams = { ...params };

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const placeholder = `:${key}`;
    if (path.includes(placeholder)) {
      path = path.replaceAll(placeholder, encodeURIComponent(String(value)));
      delete queryParams[key];
    }
  }

  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}${buildQueryString(queryParams)}`;
}

export function createApiClient(
  config: MfeConfig,
  fetchImplementation: FetchImplementation = globalThis.fetch.bind(globalThis),
): ApiClient {
  return {
    async request<T>(endpoint: EndpointConfig, options: ApiRequestOptions = {}) {
      const url = buildRequestUrl(config.baseUrl, endpoint, options.params);
      const controller = new AbortController();
      let timedOut = false;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const abortFromCaller = () => controller.abort();
      if (options.signal) {
        if (options.signal.aborted) {
          controller.abort();
        } else {
          options.signal.addEventListener('abort', abortFromCaller, { once: true });
        }
      }

      timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, endpoint.timeout);

      try {
        const response = await fetchImplementation(url, {
          method: endpoint.method,
          headers: {
            Accept: 'application/json',
            ...endpoint.headers,
            ...options.headers,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new ApiClientError(
            `HTTP request failed with status ${response.status}`,
            'HTTP_ERROR',
            url,
            response.status,
          );
        }

        if (response.status === 204) {
          return undefined as T;
        }

        return await response.json() as T;
      } catch (error) {
        if (error instanceof ApiClientError) {
          throw error;
        }

        if (timedOut) {
          throw new ApiClientError(`Request timeout: ${url}`, 'TIMEOUT', url, undefined, {
            cause: error,
          });
        }

        if (controller.signal.aborted) {
          throw new ApiClientError(`Request aborted: ${url}`, 'ABORTED', url, undefined, {
            cause: error,
          });
        }

        throw new ApiClientError(`Network request failed: ${url}`, 'NETWORK_ERROR', url, undefined, {
          cause: error,
        });
      } finally {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
        options.signal?.removeEventListener('abort', abortFromCaller);
      }
    },
  };
}
