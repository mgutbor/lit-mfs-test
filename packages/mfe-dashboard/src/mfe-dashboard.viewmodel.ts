import { LitElement, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Task } from '@lit/task';
import type { MfeContext } from '@lit-mf/shared';
import { renderDashboard } from './mfe-dashboard.view';
import type { Todo, Post } from './model/mfe-dashboard.model';

const themeLight = css`
  :host {
    --color-primary: #1976d2;
    --color-surface: #f5f5f5;
    --color-background: #ffffff;
    --color-on-primary: #ffffff;
    --color-on-surface: #212121;
    --color-text-primary: rgba(0, 0, 0, 0.87);
    --color-text-secondary: rgba(0, 0, 0, 0.6);
  }
`;

const themeDark = css`
  :host {
    --color-primary: #90caf9;
    --color-surface: #1e1e1e;
    --color-background: #121212;
    --color-on-primary: #000000;
    --color-on-surface: #ffffff;
    --color-text-primary: rgba(255, 255, 255, 0.87);
    --color-text-secondary: rgba(255, 255, 255, 0.6);
  }
`;

const dashboardTheme = css`
  :host {
    display: block;
    font-family: system-ui, -apple-system, sans-serif;
    padding: 16px;
  }

  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard h1 {
    font-size: 1.5rem;
    margin: 0 0 16px 0;
    color: var(--color-primary, #1976d2);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: var(--color-surface, #f5f5f5);
    border-radius: 4px;
    padding: 16px;
  }

  .stat-card h3 {
    margin: 0 0 4px 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
  }

  .stat-card p {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary, rgba(0, 0, 0, 0.87));
  }

  .orders-table {
    width: 100%;
    border-collapse: collapse;
  }

  .orders-table th,
  .orders-table td {
    padding: 8px 16px;
    text-align: left;
    border-bottom: 1px solid var(--color-surface, #f5f5f5);
  }

  .orders-table th {
    font-weight: 600;
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
  }

  .status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
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
    gap: 16px;
  }

  .post-card {
    background: var(--color-surface, #f5f5f5);
    border-radius: 4px;
    padding: 16px;
  }

  .post-card h3 {
    margin: 0 0 8px 0;
    font-size: 1rem;
    color: var(--color-text-primary, rgba(0, 0, 0, 0.87));
  }

  .post-card p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
  }

  .muted {
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
  }
`;

@customElement('mfe-dashboard')
export class MfeDashboard extends LitElement {
  static get styles() {
    return [dashboardTheme, themeLight, themeDark];
  }

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

  render() {
    return renderDashboard.call(this);
  }

  connectedCallback() {
    super.connectedCallback();
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
}

declare global {
  interface HTMLElementTagNameMap {
    'mfe-dashboard': MfeDashboard;
  }
}
