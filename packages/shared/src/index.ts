// Shared types and utilities for Lit MFEs
export interface MfeConfig {
  name: string;
  baseUrl: string;
}

export interface MfeContext {
  container: HTMLElement;
  config: MfeConfig;
  onNavigate: (path: string) => void;
  publish: (topic: string, data?: unknown) => void;
  subscribe: (topic: string, handler: (data: unknown) => void) => () => void;
}

export interface MfeMountResult {
  unmount: () => void;
}

export type MountFn = (container: HTMLElement, context: MfeContext) => MfeMountResult;
