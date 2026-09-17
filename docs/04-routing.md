# Routing

Routing del shell y routing interno de MFEs. Modelo shell-owned con delegación de prefijos.

## Modelo: Shell-owned

El shell es el **único dueño de `window.history`**. Los MFEs nunca usan `history.pushState` directamente. Esto evita que dos routers compitan por los eventos `popstate`.

```
/dashboard              → shell carga mfe-dashboard
/dashboard/overview     → shell carga mfe-dashboard, le pasa "/" como sub-ruta
/dashboard/analytics    → shell carga mfe-dashboard, le pasa "/analytics" como sub-ruta
/settings               → shell carga mfe-settings
/settings/profile       → shell carga mfe-settings, le pasa "/profile" como sub-ruta
```

## Routing del shell

### Configuración de rutas

```ts
// shell/src/router.ts
import { URLPattern } from 'urlpattern-polyfill';

interface Route {
  pattern: URLPattern;
  mfe: string;
  extractSubpath?: boolean;
  subpathGroup?: string;
}

const routes: Route[] = [
  {
    pattern: new URLPattern({ pathname: '/dashboard/:subpath*' }),
    mfe: '@lit-mf/dashboard',
    extractSubpath: true,
    subpathGroup: 'subpath',
  },
  {
    pattern: new URLPattern({ pathname: '/dashboard' }),
    mfe: '@lit-mf/dashboard',
    extractSubpath: false,
  },
  {
    pattern: new URLPattern({ pathname: '/settings/:subpath*' }),
    mfe: '@lit-mf/settings',
    extractSubpath: true,
    subpathGroup: 'subpath',
  },
  {
    pattern: new URLPattern({ pathname: '/settings' }),
    mfe: '@lit-mf/settings',
    extractSubpath: false,
  },
];
```

### Resolución de rutas

```ts
// shell/src/router.ts
function resolveRoute(url: string): { mfe: string; subpath: string } | null {
  for (const route of routes) {
    const match = route.pattern.exec(url);
    if (match) {
      const subpath = route.extractSubpath
        ? '/' + (match.pathname?.groups?.[route.subpathGroup ?? 'subpath'] ?? '')
        : '/';
      return { mfe: route.mfe, subpath };
    }
  }
  return null;
}
```

### Integración con el shell

```ts
// shell/src/app-shell.ts
class AppShell extends LitElement {
  @state() private currentMFE: string | null = null;
  @state() private currentSubpath: string = '/';
  private cleanupMFE: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this.handleNavigation);
    this.handleNavigation();
  }

  private handleNavigation = async () => {
    const url = window.location.pathname;
    const resolved = resolveRoute(url);

    if (!resolved) {
      this.showNotFound();
      return;
    }

    // Si el MFE cambió, desmontar el anterior y montar el nuevo
    if (resolved.mfe !== this.currentMFE) {
      await this.switchMFE(resolved.mfe, resolved.subpath);
    } else {
      // Si es el mismo MFE, solo actualizar la sub-ruta
      this.updateSubpath(resolved.subpath);
    }
  };

  private async switchMFE(mfeName: string, subpath: string) {
    // Desmontar MFE anterior
    if (this.cleanupMFE) {
      this.cleanupMFE();
      this.cleanupMFE = null;
    }

    // Limpiar container
    const container = this.shadowRoot.querySelector('#mfe-container');
    container.innerHTML = '';

    // Cargar y montar nuevo MFE
    const { mount } = await import(mfeName);
    this.cleanupMFE = mount(container, this.context);

    // Pasar sub-ruta como atributo
    const el = container.firstElementChild;
    if (el) {
      el.setAttribute('route', subpath);
    }

    this.currentMFE = mfeName;
    this.currentSubpath = subpath;
  }

  private updateSubpath(subpath: string) {
    const container = this.shadowRoot.querySelector('#mfe-container');
    const el = container?.firstElementChild;
    if (el) {
      el.setAttribute('route', subpath);
    }
    this.currentSubpath = subpath;
  }

  render() {
    return html`
      <nav>
        <a href="/dashboard">Dashboard</a>
        <a href="/settings">Settings</a>
      </nav>
      <div id="mfe-container"></div>
    `;
  }
}
```

### Navegación SPA

El shell intercepta clicks en `<a>` para evitar recargas completas:

```ts
// shell/src/app-shell.ts
private handleLinkClick(e: Event) {
  const link = (e.target as HTMLElement).closest('a');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || !href.startsWith('/') || e.metaKey || e.ctrlKey) return;

  e.preventDefault();
  window.history.pushState({}, '', href);
  this.handleNavigation();
}
```

## Routing interno del MFE

### Cuándo un MFE necesita routing interno

Un MFE necesita routing interno cuando tiene **múltiples vistas** que se alternan sin recargar el shell:

- Dashboard con overview, analytics, reports
- Settings con profile, notifications, security
- Tienda con product list, product detail, cart

Un MFE **no necesita** routing interno si es una vista única (widget simple).

### LitroRouter

[LitroRouter](https://github.com/beatzball/litro/tree/main/packages/litro-router) es un router zero-dependency para web components basado en URLPattern nativo:

```ts
// mfe-dashboard/src/dashboard-widget.ts
import { LitroRouter } from '@beatzball/litro-router';

@customElement('mfe-dashboard')
class DashboardWidget extends LitElement {
  private router: LitroRouter | null = null;

  @property({ type: String })
  route = '/';

  async firstUpdated() {
    const outlet = this.shadowRoot.querySelector('#outlet');
    this.router = new LitroRouter(outlet);
    
    this.router.setRoutes([
      { path: '/', component: 'dashboard-overview' },
      { path: '/analytics', component: 'dashboard-analytics' },
      { path: '/reports', component: 'dashboard-reports' },
      { path: '/:all(.*)*', component: 'dashboard-not-found' },
    ]);
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('route') && this.router) {
      this.router.go(this.route);
    }
  }

  render() {
    return html`<div id="outlet"></div>`;
  }
}
```

### URLPattern (sin dependencias)

Si no se quiere usar LitroRouter, se puede implementar un router mínimo con URLPattern:

```ts
// mfe-dashboard/src/router.ts
class MiniRouter {
  private outlet: HTMLElement;
  private routes: Array<{ pattern: URLPattern; component: string }> = [];

  constructor(outlet: HTMLElement) {
    this.outlet = outlet;
  }

  setRoutes(routes: Array<{ path: string; component: string }>) {
    this.routes = routes.map(r => ({
      pattern: new URLPattern({ pathname: r.path }),
      component: r.component,
    }));
  }

  go(path: string) {
    for (const route of this.routes) {
      const match = route.pattern.exec({ pathname: path });
      if (match) {
        this.renderComponent(route.component, match.pathname?.groups);
        return;
      }
    }
    this.renderComponent('not-found');
  }

  private renderComponent(tagName: string, params?: Record<string, string>) {
    this.outlet.innerHTML = '';
    const el = document.createElement(tagName);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        el.setAttribute(key, value);
      }
    }
    this.outlet.appendChild(el);
  }
}
```

## Flujo completo de navegación

### Ejemplo: Usuario navega a `/dashboard/analytics`

```
1. Usuario hace click en link "Analytics" dentro de mfe-dashboard
2. MFE llama a context.onNavigate('/dashboard/analytics')
   O el shell intercepta el click si es un <a> externo
3. Shell recibe la navegación
4. Shell llama a window.history.pushState({}, '', '/dashboard/analytics')
5. Shell resuelve la ruta: /dashboard/analytics → mfe-dashboard, subpath: /analytics
6. Shell actualiza el atributo 'route' en el mfe-dashboard
   el.setAttribute('route', '/analytics')
7. MFE detecta el cambio de atributo en updated()
8. MFE llama a this.router.go('/analytics')
9. MFE renderiza la vista de analytics
```

### Ejemplo: Usuario hace click en "Settings" (navegación cross-MFE)

```
1. Usuario hace click en link "Settings" en el nav del shell
2. Shell intercepta el click
3. Shell llama a window.history.pushState({}, '', '/settings')
4. Shell resuelve la ruta: /settings → mfe-settings, subpath: /
5. Shell desmonta mfe-dashboard (cleanup)
6. Shell limpia el container
7. Shell importa @lit-mf/settings
8. Shell llama a mount(container, context)
9. Shell crea el custom element <mfe-settings>
10. Shell le pasa el atributo route: '/'
11. mfe-settings renderiza su vista principal
```

## Reglas

1. **Solo el shell controla `window.history`.** Los MFEs nunca llaman a `pushState` o `replaceState`.
2. **Shell-owned para rutas top-level.** El shell decide qué MFE cargar.
3. **Delegación de prefijos.** El shell pasa la sub-ruta como atributo `route`.
4. **Routing interno opcional.** Solo si el MFE tiene múltiples vistas.
5. **Un solo router activo.** No dos routers compitiendo por `popstate`.
6. **Navegación via atributos.** El MFE reacciona al cambio del atributo `route`, no al evento `popstate`.
