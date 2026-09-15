import type { MfeContext, MfeModule } from '@lit-mf/shared';

interface CachedMfe {
  module: MfeModule;
  cleanup: (() => void) | null;
  container: HTMLElement;
}

const mfeCache = new Map<string, CachedMfe>();

const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
} as const;

type LoadingState = (typeof LOADING_STATES)[keyof typeof LOADING_STATES];

const loadingStates = new Map<string, LoadingState>();

export interface LoadMfeOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

const DEFAULT_OPTIONS: LoadMfeOptions = {
  retries: 2,
  retryDelay: 1000,
  timeout: 10000,
};

function setLoadingState(specifier: string, state: LoadingState) {
  loadingStates.set(specifier, state);
}

export function getLoadingState(specifier: string): LoadingState {
  return loadingStates.get(specifier) ?? LOADING_STATES.IDLE;
}

export function isMfeLoaded(specifier: string): boolean {
  return mfeCache.has(specifier);
}

export function getLoadedMfes(): string[] {
  return Array.from(mfeCache.keys());
}

async function importWithRetry(
  specifier: string,
  options: LoadMfeOptions
): Promise<MfeModule> {
  const { retries = 2, retryDelay = 1000, timeout = 10000 } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const modulePromise = import(/* @vite-ignore */ specifier);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Import timeout: ${specifier}`)), timeout)
      );

      const module = await Promise.race([modulePromise, timeoutPromise]);

      if (typeof module.mount !== 'function') {
        throw new Error(`MFE ${specifier} does not export a mount function`);
      }

      return module as MfeModule;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `MFE load attempt ${attempt + 1}/${retries + 1} failed for ${specifier}:`,
        lastError.message
      );

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error(`Failed to load MFE: ${specifier}`);
}

export async function loadMFE(
  mfeSpecifier: string,
  container: HTMLElement,
  context: Omit<MfeContext, 'container'>,
  options: LoadMfeOptions = DEFAULT_OPTIONS
): Promise<() => void> {
  if (mfeCache.has(mfeSpecifier)) {
    const cached = mfeCache.get(mfeSpecifier)!;
    if (cached.cleanup) {
      cached.cleanup();
      cached.cleanup = null;
    }
    mfeCache.delete(mfeSpecifier);
  }

  setLoadingState(mfeSpecifier, LOADING_STATES.LOADING);

  try {
    const module = await importWithRetry(mfeSpecifier, options);

    const fullContext: MfeContext = {
      ...context,
      container,
    };

    const cleanupResult = module.mount(container, fullContext);
    const cleanup =
      typeof cleanupResult === 'function'
        ? cleanupResult
        : cleanupResult?.unmount ?? (() => {});

    mfeCache.set(mfeSpecifier, {
      module,
      cleanup,
      container,
    });

    setLoadingState(mfeSpecifier, LOADING_STATES.LOADED);
    return cleanup;
  } catch (error) {
    setLoadingState(mfeSpecifier, LOADING_STATES.ERROR);
    console.error(`Failed to load MFE: ${mfeSpecifier}`, error);

    container.innerHTML = `
      <div style="padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 4px;">
        <h3 style="margin: 0 0 0.5rem 0; color: #c00;">Error cargando MFE</h3>
        <p style="margin: 0; color: #600;">${mfeSpecifier}</p>
        <p style="margin: 0.5rem 0 0 0; color: #900; font-size: 0.875rem;">
          ${error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      </div>
    `;

    return () => {};
  }
}

export function unloadMFE(mfeSpecifier: string): boolean {
  const cached = mfeCache.get(mfeSpecifier);
  if (!cached) {
    return false;
  }

  if (cached.cleanup) {
    cached.cleanup();
  }

  mfeCache.delete(mfeSpecifier);
  setLoadingState(mfeSpecifier, LOADING_STATES.IDLE);
  return true;
}

export function unloadAllMfes(): void {
  for (const [specifier] of mfeCache) {
    unloadMFE(specifier);
  }
}

export function getMfeInfo(specifier: string) {
  const cached = mfeCache.get(specifier);
  return cached
    ? {
        loaded: true,
        container: cached.container,
        hasCleanup: typeof cached.cleanup === 'function',
      }
    : null;
}
