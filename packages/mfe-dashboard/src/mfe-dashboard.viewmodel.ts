import { LitElement, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Task } from '@lit/task';
import type { MfeContext } from '@lit-mf/shared';
import { getThemeTokens, tokensToStyleString } from '@lit-mf/shared';
import { renderDashboard } from './mfe-dashboard.view';
import type { Todo, Post } from './model/mfe-dashboard.model';

const dashboardTheme = css`
  :host {
    display: block;
    font-family: var(--font-family, system-ui, -apple-system, sans-serif);
    color: var(--color-text-primary, rgba(0, 0, 0, 0.87));
    padding: var(--spacing-md, 16px);
  }

  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard h1 {
    font-size: var(--font-size-xl, 1.5rem);
    margin: 0 0 var(--spacing-md, 16px) 0;
    color: var(--color-primary, #1976d2);
  }

  .dashboard h2 {
    font-size: var(--font-size-lg, 1.25rem);
    margin: 0 0 var(--spacing-sm, 8px) 0;
    color: var(--color-text-primary, rgba(0, 0, 0, 0.87));
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md, 16px);
    margin-bottom: var(--spacing-lg, 24px);
  }

  .stat-card {
    background: var(--color-surface, #f5f5f5);
    border-radius: var(--border-radius, 4px);
    padding: var(--spacing-md, 16px);
  }

  .stat-card h3 {
    margin: 0 0 var(--spacing-xs, 4px) 0;
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
  }

  .stat-card p {
    margin: 0;
    font-size: var(--font-size-xl, 1.5rem);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, rgba(0, 0, 0, 0.87));
  }

  .orders-table {
    width: 100%;
    border-collapse: collapse;
  }

  .orders-table th,
  .orders-table td {
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    text-align: left;
    border-bottom: 1px solid var(--color-surface, #f5f5f5);
    color: var(--color-text-primary, rgba(0, 0, 0, 0.87));
  }

  .orders-table th {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
  }

  .status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--border-radius, 4px);
    font-size: var(--font-size-xs, 0.75rem);
    text-transform: capitalize;
  }

  .status-pending {
    background: #fff3e0;
    color: #e65100;
  }

  .status-delivered {
    background: #f3e5f5;
    color: #7b1fa2;
  }

  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-md, 16px);
  }

  .post-card {
    background: var(--color-surface, #f5f5f5);
    border-radius: var(--border-radius, 4px);
    padding: var(--spacing-md, 16px);
  }

  .post-card h3 {
    margin: 0 0 var(--spacing-sm, 8px) 0;
    font-size: var(--font-size-md, 1rem);
    color: var(--color-text-primary, rgba(0, 0, 0, 0.87));
  }

  .post-card p {
    margin: 0;
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
  }

  .muted {
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
  }
`;

@customElement('mfe-dashboard')
export class MfeDashboard extends LitElement {
  static styles = dashboardTheme;

  @property({ type: String })
  locale = 'es';

  @property({ type: String })
  theme: 'light' | 'dark' = 'light';

  @property({ type: String })
  route = '/';

  @state()
  private context: MfeContext | null = null;

  private unsubscribeTheme?: () => void;

  readonly todosTask = new Task(this, {
    task: async ([baseUrl, endpoint], { signal }) => {
      const url = `${baseUrl}${endpoint}`;
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<Todo[]>;
    },
    args: () => [
      this.context?.config?.baseUrl ?? '',
      this.context?.config?.endpoints?.orders?.endpoint ?? '',
    ],
  });

  readonly postsTask = new Task(this, {
    task: async ([baseUrl, endpoint], { signal }) => {
      const url = `${baseUrl}${endpoint}`;
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<Post[]>;
    },
    args: () => [
      this.context?.config?.baseUrl ?? '',
      this.context?.config?.endpoints?.analytics?.endpoint ?? '',
    ],
  });

  setContext(context: MfeContext) {
    this.context = context;
    this.locale = context.locale;
    this.theme = context.theme;
    this.route = context.route;
  }

  private subscribeToEvents() {
    if (!this.context) return;
    this.unsubscribeTheme = this.context.subscribe('shell:theme-changed', (data) => {
      const { theme } = data as { theme: 'light' | 'dark' };
      this.theme = theme;
    });
  }

  private applyThemeTokens() {
    const tokens = tokensToStyleString(getThemeTokens(this.theme));
    tokens.split(';').forEach((declaration) => {
      const [prop, value] = declaration.split(':').map((s) => s.trim());
      if (prop && value) {
        this.style.setProperty(prop, value);
      }
    });
  }

  render() {
    return renderDashboard.call(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.applyThemeTokens();
    this.subscribeToEvents();
    this.dispatchEvent(new CustomEvent('mfe:connected', {
      bubbles: true,
      composed: true,
      detail: { name: 'mfe-dashboard' },
    }));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeTheme?.();
    this.dispatchEvent(new CustomEvent('mfe:disconnected', {
      bubbles: true,
      composed: true,
      detail: { name: 'mfe-dashboard' },
    }));
  }

  updated() {
    this.applyThemeTokens();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mfe-dashboard': MfeDashboard;
  }
}
