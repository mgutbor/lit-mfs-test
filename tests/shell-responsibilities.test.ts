import { describe, expect, it, vi } from 'vitest';
import { createEventBus } from '../packages/shared/src/event-bus';
import {
  createMfeFallbackConfig,
  getMfeConfig,
  loadConfigMap,
} from '../packages/shell/src/config-manager';
import {
  applyThemeTokens,
  createThemeManager,
  getInitialTheme,
} from '../packages/shell/src/theme-manager';
import { MfeRuntime } from '../packages/shell/src/mfe-runtime';
import type { RouteMatch } from '../packages/shell/src/router';

function createConfig() {
  return {
    version: '1.0.0',
    baseUrl: '',
    'mfe-dashboard': {
      name: 'mfe-dashboard',
      baseUrl: 'https://dummyjson.com',
      endpoints: {
        orders: { endpoint: '/todos', method: 'GET' as const, timeout: 5000 },
      },
    },
    'mfe-settings': {
      name: 'mfe-settings',
      baseUrl: 'https://dummyjson.com',
      endpoints: {
        profile: { endpoint: '/users/1', method: 'GET' as const, timeout: 3000 },
      },
    },
  };
}

describe('shell configuration manager', () => {
  it('loads and validates configuration outside the shell component', async () => {
    const config = createConfig();

    await expect(loadConfigMap(async () => config)).resolves.toBe(config);
    expect(getMfeConfig(config, '@lit-mf/dashboard')?.name).toBe('mfe-dashboard');
    expect(createMfeFallbackConfig(null, '@lit-mf/settings')).toEqual({
      name: '@lit-mf/settings',
      baseUrl: '',
      endpoints: {},
    });
  });
});

describe('shell MFE runtime', () => {
  it('discards a stale load when a newer route starts', async () => {
    const container = document.createElement('div');
    const firstCleanup = vi.fn();
    const cleanups: Array<ReturnType<typeof vi.fn>> = [];
    const routes: RouteMatch[] = [
      { mfe: 'mfe:first', route: '/first', subpath: '/' },
      { mfe: 'mfe:second', route: '/second', subpath: '/' },
    ];
    let resolveFirst!: (cleanup: () => void) => void;
    const loadMfe = vi.fn((specifier: string) => {
      if (specifier === 'mfe:first') {
        return new Promise<() => void>((resolve) => {
          resolveFirst = () => resolve(firstCleanup);
        });
      }
      const cleanup = vi.fn();
      cleanups.push(cleanup);
      return Promise.resolve(cleanup);
    });
    const runtime = new MfeRuntime({
      getContainer: () => container,
      waitForRender: async () => undefined,
      loadMfe,
    });
    const context = {} as never;

    const firstLoad = runtime.load(routes[0], context);
    await Promise.resolve();
    const secondLoad = runtime.load(routes[1], context);
    await secondLoad;
    resolveFirst(firstCleanup);
    await firstLoad;

    expect(loadMfe).toHaveBeenCalledTimes(2);
    expect(firstCleanup).toHaveBeenCalledOnce();
    expect(cleanups[0]).not.toHaveBeenCalled();
  });
});

describe('shell theme manager', () => {
  it('applies tokens and propagates validated theme events', () => {
    const target = document.createElement('div');
    const eventBus = createEventBus();
    const onThemeChanged = vi.fn();
    const manager = createThemeManager(target, eventBus, onThemeChanged);
    const unsubscribe = manager.subscribe();

    manager.apply('dark');
    expect(target.style.getPropertyValue('--color-background')).toBe('#121212');
    expect(onThemeChanged).toHaveBeenCalledWith('dark');

    eventBus.publish('mfe-settings:theme-changed', { theme: 'light' });
    expect(onThemeChanged).toHaveBeenLastCalledWith('light');

    eventBus.publish('mfe-settings:theme-changed', { theme: 'auto' as 'light' });
    expect(onThemeChanged).toHaveBeenLastCalledWith('light');

    unsubscribe();
  });

  it('defaults to light when no dark preference is stored', () => {
    expect(getInitialTheme()).toBe('light');
    applyThemeTokens(document.createElement('div'), 'light');
  });
});
