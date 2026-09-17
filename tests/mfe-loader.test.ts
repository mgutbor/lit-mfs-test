import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MfeContext, MfeModule } from '../packages/shared/src/types';
import {
  getLoadingState,
  isMfeLoaded,
  loadMFE,
  unloadAllMfes,
  unloadMFE,
} from '../packages/shell/src/mfe-loader';

const context = {} as Omit<MfeContext, 'container'>;

function createContainer(): HTMLElement {
  return document.createElement('div');
}

function createModule(cleanup = vi.fn()): MfeModule {
  return {
    mount: vi.fn(() => cleanup),
  };
}

afterEach(() => {
  unloadAllMfes();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('loadMFE', () => {
  it('mounts, caches and cleans up a loaded MFE', async () => {
    const cleanup = vi.fn();
    const module = createModule(cleanup);
    const container = createContainer();

    const returnedCleanup = await loadMFE('mfe:test', container, context, {
      importModule: async () => module,
    });

    expect(isMfeLoaded('mfe:test')).toBe(true);
    expect(getLoadingState('mfe:test')).toBe('loaded');

    returnedCleanup();
    expect(cleanup).toHaveBeenCalledOnce();

    unloadMFE('mfe:test');
    expect(isMfeLoaded('mfe:test')).toBe(false);
  });

  it('retries failed imports and clears the retry timer after success', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const module = createModule();
    const importModule = vi.fn()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce(module);

    const loadPromise = loadMFE('mfe:retry', createContainer(), context, {
      retries: 1,
      retryDelay: 100,
      timeout: 500,
      importModule,
    });

    await vi.advanceTimersByTimeAsync(100);
    await loadPromise;

    expect(importModule).toHaveBeenCalledTimes(2);
    expect(getLoadingState('mfe:retry')).toBe('loaded');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('renders an error after the import timeout', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const container = createContainer();
    const loadPromise = loadMFE('mfe:timeout', container, context, {
      retries: 0,
      timeout: 50,
      importModule: () => new Promise<MfeModule>(() => undefined),
    });

    await vi.advanceTimersByTimeAsync(50);
    await loadPromise;

    expect(getLoadingState('mfe:timeout')).toBe('error');
    expect(container.textContent).toContain('Error cargando MFE');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not leave a stale MFE mounted after cancellation', async () => {
    let resolveImport!: (module: MfeModule) => void;
    const module = createModule();
    const loadPromise = loadMFE('mfe:cancelled', createContainer(), context, {
      retries: 0,
      importModule: () => new Promise<MfeModule>((resolve) => {
        resolveImport = resolve;
      }),
    });

    unloadMFE('mfe:cancelled');
    resolveImport(module);
    await loadPromise;

    expect(module.mount).not.toHaveBeenCalled();
    expect(getLoadingState('mfe:cancelled')).toBe('idle');
    expect(isMfeLoaded('mfe:cancelled')).toBe(false);
  });

  it('renders an error when mount fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = createContainer();
    const module: MfeModule = {
      mount: vi.fn(() => {
        throw new Error('mount failed');
      }),
    };

    await loadMFE('mfe:mount-error', container, context, {
      importModule: async () => module,
    });

    expect(getLoadingState('mfe:mount-error')).toBe('error');
    expect(container.textContent).toContain('mount failed');
    expect(isMfeLoaded('mfe:mount-error')).toBe(false);
  });
});
