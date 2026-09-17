import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { ConfigMap } from '@lit-mf/shared';
import { createEventBus } from '@lit-mf/shared';
import { getInitialPath, resolveRoute } from './router';
import { loadConfigMap, createMfeFallbackConfig } from './config-manager';
import { createThemeManager, getInitialTheme, type Theme, applyThemeTokens } from './theme-manager';
import { MfeRuntime } from './mfe-runtime';

const eventBus = createEventBus();

@customElement('lit-mf-shell')
export class LitMfShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      color: var(--color-text-primary, rgba(0, 0, 0, 0.87));
      background: var(--color-background, #f5f5f5);
    }
    .shell-layout {
      display: grid;
      grid-template-columns: 250px 1fr;
      min-height: 100vh;
    }
    .sidebar {
      background: var(--color-surface, #1a1a2e);
      padding: 1rem;
      color: var(--color-on-surface, #ffffff);
    }
    .sidebar h2 {
      margin-top: 0;
      font-size: 1.25rem;
    }
    .nav-links {
      list-style: none;
      padding: 0;
      margin: 1rem 0 0 0;
    }
    .nav-links li {
      margin: 0.5rem 0;
    }
    .nav-links a {
      color: var(--color-primary, #64b5f6);
      text-decoration: none;
      padding: 0.5rem;
      display: block;
      border-radius: 4px;
    }
    .nav-links a:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .nav-links a.active {
      background: var(--color-primary, #64b5f6);
      color: var(--color-on-primary, #000000);
    }
    .main-content {
      padding: 2rem;
      background: var(--color-background, #f5f5f5);
    }
    .not-found {
      max-width: 640px;
      margin: 4rem auto;
      text-align: center;
      color: var(--color-text-primary, rgba(0, 0, 0, 0.87));
    }
    .not-found h1 {
      color: var(--color-error, #d32f2f);
    }
  `;

  @state()
  currentRoute = getInitialPath();

  @state()
  private routeNotFound = false;

  @state()
  currentTheme: Theme = getInitialTheme();

  private configMap: ConfigMap | null = null;

  private readonly themeManager = createThemeManager(
    this,
    eventBus,
    (theme) => {
      this.currentTheme = theme;
      this.updateMountedMfeTheme(theme);
    },
  );

  private readonly mfeRuntime = new MfeRuntime({
    getContainer: () => this.shadowRoot?.querySelector('#mfe-container') ?? null,
    waitForRender: () => this.updateComplete,
  });

  private unsubscribeTheme?: () => void;

  private handlePopState = () => {
    void this.syncRouteFromLocation(false);
  };

  async firstUpdated() {
    applyThemeTokens(this, this.currentTheme);
    window.addEventListener('popstate', this.handlePopState);
    try {
      this.configMap = await loadConfigMap();
    } catch (error) {
      console.error('Error loading config map:', error);
      this.configMap = {
        version: '1.0.0',
        baseUrl: '',
      };
    }
    this.unsubscribeTheme = this.themeManager.subscribe();
    await this.syncRouteFromLocation(true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.handlePopState);
    this.unsubscribeTheme?.();
    this.mfeRuntime.unload();
  }

  private async syncRouteFromLocation(replaceRoot: boolean) {
    const path = window.location.pathname;
    const route = resolveRoute(path);

    if (!route) {
      this.currentRoute = path;
      this.routeNotFound = true;
      this.mfeRuntime.unload();
      return;
    }

    if (replaceRoot && path !== route.route) {
      window.history.replaceState({}, '', route.route);
    }

    this.currentRoute = route.route;
    this.routeNotFound = false;
    await this.loadMfe(route);
  }

  private async loadMfe(route: { mfe: string; route: string; subpath: string }) {
    const context = {
      locale: 'es',
      theme: this.currentTheme,
      route: route.route,
      config: createMfeFallbackConfig(this.configMap, route.mfe),
      onNavigate: (path: string) => this.navigate(path),
      publish: eventBus.publish,
      subscribe: eventBus.subscribe,
    };

    await this.mfeRuntime.load(route, context);
  }

  private updateMountedMfeTheme(theme: 'light' | 'dark') {
    const mfe = this.shadowRoot?.querySelector<HTMLElement>('#mfe-container > *') as
      | (HTMLElement & { theme?: 'light' | 'dark' })
      | null;
    if (mfe) {
      mfe.theme = theme;
    }
  }


  private navigate(path: string, replace = false) {
    const route = resolveRoute(path);
    const targetPath = path.split(/[?#]/, 1)[0] || '/';

    window.history[replace ? 'replaceState' : 'pushState']({}, '', targetPath);

    if (!route) {
      this.currentRoute = targetPath;
      this.routeNotFound = true;
      this.mfeRuntime.unload();
      return;
    }

    this.currentRoute = route.route;
    this.routeNotFound = false;
    void this.loadMfe(route);
  }

  render() {
    return html`
      <div class="shell-layout">
        <nav class="sidebar">
          <h2>MFE Shell</h2>
          <ul class="nav-links">
            <li>
              <a
                href="/dashboard"
                class="${this.currentRoute === '/dashboard' ? 'active' : ''}"
                @click=${(e: Event) => {
                  e.preventDefault();
                  this.navigate('/dashboard');
                }}
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="/settings"
                class="${this.currentRoute === '/settings' ? 'active' : ''}"
                @click=${(e: Event) => {
                  e.preventDefault();
                  this.navigate('/settings');
                }}
              >
                Settings
              </a>
            </li>
          </ul>
        </nav>
        <main class="main-content">
          ${this.routeNotFound
            ? html`
                <div class="not-found">
                  <h1>404</h1>
                  <p>La ruta <strong>${this.currentRoute}</strong> no existe.</p>
                  <a href="/dashboard" @click=${(e: Event) => {
                    e.preventDefault();
                    this.navigate('/dashboard');
                  }}>Volver al dashboard</a>
                </div>
              `
            : html`<div id="mfe-container"></div>`}
        </main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-mf-shell': LitMfShell;
  }
}
