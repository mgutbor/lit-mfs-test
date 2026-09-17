import type { MfeContext } from '@lit-mf/shared';
import { loadMFE, unloadAllMfes } from './mfe-loader';
import type { RouteMatch } from './router';

export type MfeRuntimeContext = Omit<MfeContext, 'container'>;

export interface MfeRuntimeOptions {
  getContainer: () => HTMLElement | null;
  waitForRender: () => Promise<unknown>;
  loadMfe?: typeof loadMFE;
}

export class MfeRuntime {
  private cleanup: (() => void) | null = null;
  private requestId = 0;

  constructor(private readonly options: MfeRuntimeOptions) {}

  async load(route: RouteMatch, context: MfeRuntimeContext): Promise<void> {
    const requestId = ++this.requestId;
    this.unload(false);
    await this.options.waitForRender();

    const container = this.options.getContainer();
    if (!container) {
      console.error('MFE container not found');
      return;
    }

    const cleanup = await (this.options.loadMfe ?? loadMFE)(route.mfe, container, context, {
      retries: 2,
      retryDelay: 1000,
      timeout: 10000,
    });

    if (requestId !== this.requestId) {
      cleanup();
      return;
    }

    this.cleanup = cleanup;
  }

  unload(invalidate = true): void {
    if (invalidate) this.requestId++;
    unloadAllMfes();
    this.cleanup?.();
    this.cleanup = null;
  }
}
