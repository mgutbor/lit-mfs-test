export interface EndpointConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  timeout: number;
  headers?: Record<string, string>;
}

export interface MfeConfig {
  name: string;
  baseUrl: string;
  endpoints: Record<string, EndpointConfig>;
}

export interface ConfigMap {
  version: string;
  baseUrl: string;
  'mfe-dashboard'?: MfeConfig;
  'mfe-settings'?: MfeConfig;
}

export interface MfeContext {
  locale: string;
  theme: 'light' | 'dark';
  route: string;
  container: HTMLElement;
  config: MfeConfig;
  onNavigate: (path: string) => void;
  publish: (topic: string, data?: unknown) => void;
  subscribe: (topic: string, handler: (data: unknown) => void) => () => void;
}

export interface EventBus {
  publish: (topic: string, data?: unknown) => void;
  subscribe: (topic: string, handler: (data: unknown) => void) => () => void;
}

export interface MfeModule {
  mount: (
    container: HTMLElement,
    context: MfeContext,
  ) => (() => void) | { unmount: () => void };
  unmount?: () => void;
}
