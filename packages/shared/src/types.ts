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

export interface EventMap {
  'mfe-dashboard:order-selected': {
    orderId: number;
    total?: number;
    currency?: string;
  };
  'mfe-dashboard:filter-changed': {
    filters: Record<string, unknown>;
  };
  'mfe-settings:theme-changed': {
    theme: 'light' | 'dark';
  };
  'mfe-settings:locale-changed': {
    locale: string;
  };
  'mfe-settings:profile-updated': {
    userId: string;
  };
  'shell:theme-changed': {
    theme: 'light' | 'dark';
  };
  'shell:locale-changed': {
    locale: string;
  };
  'shell:user-logged-out': Record<string, never>;
}

type EventTopic<Events extends EventMap> = keyof Events & string;
type EventPayload<Events extends EventMap, Topic extends string> =
  Topic extends EventTopic<Events> ? Events[Topic] : unknown;
type EventArguments<Events extends EventMap, Topic extends string> =
  Topic extends EventTopic<Events> ? [data: EventPayload<Events, Topic>] : [data?: unknown];

export interface MfeContext {
  locale: string;
  theme: 'light' | 'dark';
  route: string;
  container: HTMLElement;
  config: MfeConfig;
  onNavigate: (path: string) => void;
  publish: EventBus['publish'];
  subscribe: EventBus['subscribe'];
}

export interface EventBus<Events extends EventMap = EventMap> {
  publish: <Topic extends string>(
    topic: Topic,
    ...data: EventArguments<Events, Topic>
  ) => void;
  subscribe: <Topic extends string>(
    topic: Topic,
    handler: (data: EventPayload<Events, Topic>) => void,
  ) => () => void;
}

export interface MfeModule {
  mount: (
    container: HTMLElement,
    context: MfeContext,
  ) => (() => void) | { unmount: () => void };
  unmount?: () => void;
}
