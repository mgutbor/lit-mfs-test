import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Task } from '@lit/task';
import type { MfeContext } from '@lit-mf/shared';
import { getThemeTokens, tokensToStyleString } from '@lit-mf/shared';
import { renderDashboard } from './mfe-dashboard.view';
import { dashboardTheme } from './css/mfe-dashboard-theme.css';
import type { Todo, Post } from './model/mfe-dashboard.model';

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
