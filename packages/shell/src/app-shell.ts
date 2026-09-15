import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createEventBus } from '@lit-mf/shared';
import { loadMFE } from './mfe-loader';

const eventBus = createEventBus();

@customElement('lit-mf-shell')
export class LitMfShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
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
  `;

  @state()
  currentRoute = '/dashboard';

  private cleanupMfe: (() => void) | null = null;

  private mfeModules: Record<string, string> = {
    '/dashboard': '@lit-mf/dashboard',
    '/settings': '@lit-mf/settings',
  };

  async firstUpdated() {
    await this.loadMfe(this.currentRoute);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unloadCurrentMfe();
  }

  private async loadMfe(route: string) {
    const mfeSpecifier = this.mfeModules[route];
    if (!mfeSpecifier) {
      console.warn(`No MFE found for route: ${route}`);
      return;
    }

    this.unloadCurrentMfe();

    const container = this.shadowRoot?.querySelector('#mfe-container');
    if (!container) {
      console.error('MFE container not found');
      return;
    }

    const context = {
      locale: 'es',
      theme: 'light' as const,
      route,
      config: {
        name: mfeSpecifier,
        baseUrl: window.location.origin,
      },
      onNavigate: (path: string) => this.navigate(path),
      publish: eventBus.publish,
      subscribe: eventBus.subscribe,
    };

    this.cleanupMfe = await loadMFE(
      mfeSpecifier,
      container as HTMLElement,
      context,
      { retries: 2, retryDelay: 1000, timeout: 10000 }
    );
  }

  private unloadCurrentMfe() {
    if (this.cleanupMfe) {
      this.cleanupMfe();
      this.cleanupMfe = null;
    }
  }

  private navigate(path: string) {
    this.currentRoute = path;
    this.loadMfe(path);
  }

  render() {
    return html`
      <div class="shell-layout">
        <nav class="sidebar">
          <h2>MFE Shell</h2>
          <ul class="nav-links">
            <li>
              <a
                href="#dashboard"
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
                href="#settings"
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
          <div id="mfe-container"></div>
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