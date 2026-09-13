import type { EndpointConfig } from './types';

export function buildUrl(endpoint: EndpointConfig, params?: Record<string, string>): string {
  let url = `${endpoint.baseUrl}${endpoint.path}`;

  if (params) {
    const queryString = buildQueryString(params);
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
}

export function buildQueryString(params: Record<string, string>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  }

  return searchParams.toString();
}
