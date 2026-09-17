import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EndpointConfig, MfeConfig } from '../packages/shared/src/types';
import {
  ApiClientError,
  buildRequestUrl,
  createApiClient,
} from '../packages/shared/src/api';

const config: MfeConfig = {
  name: 'mfe-dashboard',
  baseUrl: 'https://api.example.com/',
  endpoints: {},
};

const endpoint: EndpointConfig = {
  endpoint: '/orders/:id',
  method: 'GET',
  timeout: 1000,
  headers: { 'X-Client': 'dashboard' },
};

afterEach(() => {
  vi.useRealTimers();
});

describe('buildRequestUrl', () => {
  it('joins base URL, replaces path params and appends query params', () => {
    expect(buildRequestUrl(config.baseUrl, endpoint, {
      id: '42',
      include: 'items',
    })).toBe('https://api.example.com/orders/42?include=items');
  });
});

describe('createApiClient', () => {
  it('applies method and merged headers and parses JSON', async () => {
    const fetchImplementation = vi.fn(async () => new Response(
      JSON.stringify({ ok: true }),
      { status: 200 },
    ));
    const client = createApiClient(config, fetchImplementation);

    const result = await client.request<{ ok: boolean }>(endpoint, {
      headers: { Authorization: 'Bearer test' },
      params: { id: '42' },
    });

    expect(result).toEqual({ ok: true });
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://api.example.com/orders/42',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Client': 'dashboard',
          Authorization: 'Bearer test',
        },
      }),
    );
  });

  it('normalizes HTTP errors', async () => {
    const fetchImplementation = vi.fn(async () => new Response(null, { status: 503 }));
    const client = createApiClient(config, fetchImplementation);

    await expect(client.request(endpoint)).rejects.toMatchObject<ApiClientError>({
      code: 'HTTP_ERROR',
      status: 503,
    });
  });

  it('normalizes network errors', async () => {
    const fetchImplementation = vi.fn(async () => {
      throw new Error('connection refused');
    });
    const client = createApiClient(config, fetchImplementation);

    await expect(client.request(endpoint)).rejects.toMatchObject<ApiClientError>({
      code: 'NETWORK_ERROR',
    });
  });

  it('aborts requests when the endpoint timeout expires', async () => {
    vi.useFakeTimers();
    const fetchImplementation = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => (
      new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      })
    ));
    const client = createApiClient(config, fetchImplementation);

    const request = client.request({ ...endpoint, timeout: 50 });
    const expectation = expect(request).rejects.toMatchObject<ApiClientError>({ code: 'TIMEOUT' });
    await vi.advanceTimersByTimeAsync(50);

    await expectation;
  });

  it('propagates caller cancellation as a normalized abort error', async () => {
    const controller = new AbortController();
    const fetchImplementation = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => (
      new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      })
    ));
    const client = createApiClient(config, fetchImplementation);

    const request = client.request(endpoint, { signal: controller.signal });
    const expectation = expect(request).rejects.toMatchObject<ApiClientError>({ code: 'ABORTED' });
    controller.abort();

    await expectation;
  });
});
