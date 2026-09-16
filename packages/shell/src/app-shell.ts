import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { ConfigMap, MfeConfig } from '@lit-mf/shared';
import { createEventBus, createNamespacedStorage, getThemeTokens } from '@lit-mf/shared';
import { loadMFE, unloadMFE } from './mfe-loader';
import { getInitialPath, resolveRoute, type RouteMatch } from './router';

const eventBus = createEventBus();
const themeStorage = createNamespacedStorage('mfe-settings');

function getInitialTheme(): 'light' | 'dark' {
  const savedTheme = themeStorage.getItem('theme');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

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
  currentTheme: 'light' | 'dark' = getInitialTheme();

  private configMap: ConfigMap | null = null;

  private cleanupMfe: (() => void) | null = null;

  private currentMfeSpecifier: string | null = null;

  private unsubscribeTheme?: () => void;

  private mfeConfigKeys: Record<string, string> = {
    '@lit-mf/dashboard': 'mfe-dashboard',
    '@lit-mf/settings': 'mfe-settings',
  };

  private handlePopState = () => {
    void this.syncRouteFromLocation(false);
  };

  async firstUpdated() {
    this.applyThemeTokens();
    window.addEventListener('popstate', this.handlePopState);
    await this.loadConfigMap();
    this.subscribeToEvents();
    await this.syncRouteFromLocation(true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.handlePopState);
    this.unsubscribeTheme?.();
    this.unloadCurrentMfe();
  }

  private subscribeToEvents() {
    this.unsubscribeTheme = eventBus.subscribe('mfe-settings:theme-changed', (data) => {
      const { theme } = data as { theme: 'light' | 'dark' };
      this.currentTheme = theme;
      this.applyThemeTokens();
      this.updateMountedMfeTheme(theme);
      eventBus.publish('shell:theme-changed', { theme });
    });
  }

  private async loadConfigMap() {
    try {
      const response = await fetch('/config-map.json');
      if (!response.ok) {
        throw new Error(`Failed to load config map: ${response.status}`);
      }
      this.configMap = await response.json();
    } catch (error) {
      console.error('Error loading config map:', error);
      this.configMap = {
        version: '1.0.0',
        baseUrl: '',
      };
    }
  }

  private getMfeConfig(mfeSpecifier: string): MfeConfig | undefined {
    if (!this.configMap) return undefined;
    const configKey = this.mfeConfigKeys[mfeSpecifier];
    if (!configKey) return undefined;
    return this.configMap[configKey as keyof ConfigMap] as MfeConfig | undefined;
  }

  private async syncRouteFromLocation(replaceRoot: boolean) {
    const path = window.location.pathname;
    const route = resolveRoute(path);

    if (!route) {
      this.currentRoute = path;
      this.routeNotFound = true;
      this.unloadCurrentMfe();
      return;
    }

    if (replaceRoot && path !== route.route) {
      window.history.replaceState({}, '', route.route);
    }

    this.currentRoute = route.route;
    this.routeNotFound = false;
    await this.loadMfe(route);
  }

  private async loadMfe(route: RouteMatch) {
    this.unloadCurrentMfe();

    const container = this.shadowRoot?.querySelector('#mfe-container');
    if (!container) {
      console.error('MFE container not found');
      return;
    }

    const mfeConfig = this.getMfeConfig(route.mfe);

    const context = {
      locale: 'es',
      theme: this.currentTheme,
      route: route.route,
      config: mfeConfig ?? {
        name: route.mfe,
        baseUrl: this.configMap?.baseUrl ?? '',
        endpoints: {},
      },
      onNavigate: (path: string) => this.navigate(path),
      publish: eventBus.publish,
      subscribe: eventBus.subscribe,
    };

    this.cleanupMfe = await loadMFE(
      route.mfe,
      container as HTMLElement,
      context,
      { retries: 2, retryDelay: 1000, timeout: 10000 }
    );
    this.currentMfeSpecifier = route.mfe;
  }

  private updateMountedMfeTheme(theme: 'light' | 'dark') {
    const mfe = this.shadowRoot?.querySelector<HTMLElement>('#mfe-container > *') as
      | (HTMLElement & { theme?: 'light' | 'dark' })
      | null;
    if (mfe) {
      mfe.theme = theme;
    }
  }

  private applyThemeTokens() {
    const tokens = getThemeTokens(this.currentTheme);
    Object.entries(tokens).forEach(([property, value]) => {
      this.style.setProperty(property, value);
    });
  }

  private unloadCurrentMfe() {
    if (this.currentMfeSpecifier) {
      unloadMFE(this.currentMfeSpecifier);
      this.currentMfeSpecifier = null;
      this.cleanupMfe = null;
      return;
    }

    this.cleanupMfe?.();
    this.cleanupMfe = null;
  }

  private navigate(path: string, replace = false) {
    const route = resolveRoute(path);
    const targetPath = path.split(/[?#]/, 1)[0] || '/';

    window.history[replace ? 'replaceState' : 'pushState']({}, '', targetPath);

    if (!route) {
      this.currentRoute = targetPath;
      this.routeNotFound = true;
      this.unloadCurrentMfe();
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
