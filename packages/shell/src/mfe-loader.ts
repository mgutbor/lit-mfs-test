import type { MfeContext, MfeModule } from '@lit-mf/shared';

interface CachedMfe {
  module: MfeModule;
  cleanup: (() => void) | null;
  container: HTMLElement;
}

interface LoadOperation {
  cancelled: boolean;
  cancel: () => void;
  cancellation: Promise<never>;
}

const mfeCache = new Map<string, CachedMfe>();
const pendingLoads = new Map<string, LoadOperation>();

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
  importModule?: (specifier: string) => Promise<MfeModule>;
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

function createCancellationError(specifier: string): Error {
  return new Error(`MFE load cancelled: ${specifier}`);
}

function createLoadOperation(): LoadOperation {
  let cancelOperation!: () => void;
  const cancellation = new Promise<never>((_, reject) => {
    cancelOperation = () => reject(createCancellationError('pending'));
  });

  return {
    cancelled: false,
    cancel: cancelOperation,
    cancellation,
  };
}

async function waitForRetry(
  delay: number,
  operation: LoadOperation,
): Promise<void> {
  await Promise.race([
    new Promise<void>((resolve) => setTimeout(resolve, delay)),
    operation.cancellation,
  ]);
}

async function importWithRetry(
  specifier: string,
  options: LoadMfeOptions,
  operation: LoadOperation,
): Promise<MfeModule> {
  const {
    retries = 2,
    retryDelay = 1000,
    timeout = 10000,
    importModule = (moduleSpecifier) => import(/* @vite-ignore */ moduleSpecifier),
  } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (operation.cancelled) {
      throw createCancellationError(specifier);
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const modulePromise = importModule(specifier);
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`Import timeout: ${specifier}`)),
          timeout,
        );
      });

      const module = await Promise.race([
        modulePromise,
        timeoutPromise,
        operation.cancellation,
      ]);

      if (typeof module.mount !== 'function') {
        throw new Error(`MFE ${specifier} does not export a mount function`);
      }

      return module;
    } catch (error) {
      if (operation.cancelled) {
        throw createCancellationError(specifier);
      }

      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `MFE load attempt ${attempt + 1}/${retries + 1} failed for ${specifier}:`,
        lastError.message,
      );

      if (attempt < retries) {
        await waitForRetry(retryDelay * (attempt + 1), operation);
      }
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }

  throw lastError ?? new Error(`Failed to load MFE: ${specifier}`);
}

function cancelPendingLoad(specifier: string): void {
  const operation = pendingLoads.get(specifier);
  if (!operation) return;

  operation.cancelled = true;
  operation.cancel();
  pendingLoads.delete(specifier);
}

export async function loadMFE(
  mfeSpecifier: string,
  container: HTMLElement,
  context: Omit<MfeContext, 'container'>,
  options: LoadMfeOptions = DEFAULT_OPTIONS,
): Promise<() => void> {
  cancelPendingLoad(mfeSpecifier);
  unloadMFE(mfeSpecifier);

  const operation = createLoadOperation();
  pendingLoads.set(mfeSpecifier, operation);
  setLoadingState(mfeSpecifier, LOADING_STATES.LOADING);

  try {
    const module = await importWithRetry(mfeSpecifier, options, operation);

    if (operation.cancelled) {
      throw createCancellationError(mfeSpecifier);
    }

    const fullContext: MfeContext = {
      ...context,
      container,
    };

    const cleanupResult = module.mount(container, fullContext);
    const cleanup =
      typeof cleanupResult === 'function'
        ? cleanupResult
        : cleanupResult?.unmount ?? (() => {});

    if (operation.cancelled) {
      cleanup();
      throw createCancellationError(mfeSpecifier);
    }

    mfeCache.set(mfeSpecifier, {
      module,
      cleanup,
      container,
    });

    setLoadingState(mfeSpecifier, LOADING_STATES.LOADED);
    return cleanup;
  } catch (error) {
    if (operation.cancelled) {
      setLoadingState(mfeSpecifier, LOADING_STATES.IDLE);
      return () => {};
    }

    setLoadingState(mfeSpecifier, LOADING_STATES.ERROR);
    console.error(`Failed to load MFE: ${mfeSpecifier}`, error);

    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = 'padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 4px;';

    const title = document.createElement('h3');
    title.textContent = 'Error cargando MFE';
    title.style.cssText = 'margin: 0 0 0.5rem 0; color: #c00;';

    const specifier = document.createElement('p');
    specifier.textContent = mfeSpecifier;
    specifier.style.cssText = 'margin: 0; color: #600;';

    const message = document.createElement('p');
    message.textContent = error instanceof Error ? error.message : 'Error desconocido';
    message.style.cssText = 'margin: 0.5rem 0 0 0; color: #900; font-size: 0.875rem;';

    errorContainer.append(title, specifier, message);
    container.replaceChildren(errorContainer);

    return () => {};
  } finally {
    if (pendingLoads.get(mfeSpecifier) === operation) {
      pendingLoads.delete(mfeSpecifier);
    }
  }
}

export function unloadMFE(mfeSpecifier: string): boolean {
  cancelPendingLoad(mfeSpecifier);

  const cached = mfeCache.get(mfeSpecifier);
  if (!cached) {
    setLoadingState(mfeSpecifier, LOADING_STATES.IDLE);
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
  for (const specifier of pendingLoads.keys()) {
    cancelPendingLoad(specifier);
  }

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
