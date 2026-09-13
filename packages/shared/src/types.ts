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

export interface MfeConfig {
  name: string;
  baseUrl: string;
}

export interface EventBus {
  publish: (topic: string, data?: unknown) => void;
  subscribe: (topic: string, handler: (data: unknown) => void) => () => void;
}

export interface EndpointConfig {
  baseUrl: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
}

export interface MfeModule {
  mount: (container: HTMLElement, context: MfeContext) => { unmount: () => void };
  unmount?: () => void;
}
