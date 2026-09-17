import { describe, expect, it, vi } from 'vitest';

class TestURLPattern {
  private readonly pathname: string;

  constructor({ pathname }: { pathname: string }) {
    this.pathname = pathname;
  }

  exec(input: string) {
    const pathname = new URL(input).pathname;

    if (this.pathname === '/settings' && pathname === '/settings') {
      return { pathname: { groups: {} } };
    }

    if (this.pathname === '/dashboard/:subpath*' && pathname.startsWith('/dashboard')) {
      const subpath = pathname.slice('/dashboard'.length).replace(/^\//, '');
      return { pathname: { groups: { subpath: subpath || undefined } } };
    }

    return null;
  }
}

vi.stubGlobal('URLPattern', TestURLPattern);

const { resolveRoute } = await import('../packages/shell/src/router');

describe('resolveRoute', () => {
  it('normalizes the root path to the dashboard route', () => {
    expect(resolveRoute('/')).toEqual({
      mfe: '@lit-mf/dashboard',
      route: '/dashboard',
      subpath: '/',
    });
  });

  it('resolves the dashboard route', () => {
    expect(resolveRoute('/dashboard')).toEqual({
      mfe: '@lit-mf/dashboard',
      route: '/dashboard',
      subpath: '/',
    });
  });

  it('resolves dashboard subroutes', () => {
    expect(resolveRoute('/dashboard/analytics')).toEqual({
      mfe: '@lit-mf/dashboard',
      route: '/dashboard/analytics',
      subpath: '/analytics',
    });
  });

  it('resolves the settings route and trailing slash', () => {
    expect(resolveRoute('/settings/')).toEqual({
      mfe: '@lit-mf/settings',
      route: '/settings',
      subpath: '/',
    });
  });

  it('returns null for an unknown route', () => {
    expect(resolveRoute('/unknown')).toBeNull();
  });
});
