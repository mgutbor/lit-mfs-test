export interface RouteMatch {
  mfe: string;
  route: string;
  subpath: string;
}

interface URLPatternResult {
  pathname?: {
    groups?: Record<string, string | undefined>;
  };
}

interface URLPatternInstance {
  exec(input: string): URLPatternResult | null;
}

interface URLPatternConstructor {
  new (init: { pathname: string }): URLPatternInstance;
}

interface RouteDefinition {
  pattern: URLPatternInstance;
  mfe: string;
}

const URLPatternClass = (
  globalThis as typeof globalThis & { URLPattern?: URLPatternConstructor }
).URLPattern;

if (!URLPatternClass) {
  throw new Error('URLPattern is not supported by this browser');
}

const routes: RouteDefinition[] = [
  {
    pattern: new URLPatternClass({ pathname: '/dashboard/:subpath*' }),
    mfe: '@lit-mf/dashboard',
  },
  {
    pattern: new URLPatternClass({ pathname: '/settings' }),
    mfe: '@lit-mf/settings',
  },
];

function normalizePath(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0] || '/';
  if (pathname === '/') return '/dashboard';
  return pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
}

export function resolveRoute(path: string): RouteMatch | null {
  const route = normalizePath(path);
  const baseUrl = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
  const absoluteUrl = new URL(route, baseUrl).href;

  for (const definition of routes) {
    const match = definition.pattern.exec(absoluteUrl);
    if (!match) continue;

    const subpath = match.pathname?.groups?.subpath;
    return {
      mfe: definition.mfe,
      route,
      subpath: subpath ? `/${subpath}` : '/',
    };
  }

  return null;
}

export function getInitialPath(): string {
  return typeof window === 'undefined' ? '/dashboard' : window.location.pathname;
}
