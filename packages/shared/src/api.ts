import type { EndpointConfig } from './types';

export function buildUrl(endpoint: EndpointConfig, params?: Record<string, string>): string {
  let url = endpoint.endpoint;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, value);
    }
  }

  const queryString = buildQueryString(params ?? {});
  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const str = searchParams.toString();
  return str ? `?${str}` : '';
}
