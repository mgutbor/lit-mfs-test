import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { MfeContext } from '@lit-mf/shared';
import { dashboardTheme } from './css/mfe-dashboard-theme.css';
import { renderDashboard } from './mfe-dashboard.view';

@customElement('mfe-dashboard')
export class MfeDashboard extends LitElement {
  static styles = dashboardTheme;

  @property({ type: String })
  locale = 'es';

  @property({ type: String })
  theme: 'light' | 'dark' = 'light';

  @property({ type: String })
  route = '/';

  setContext(context: MfeContext) {
    this.locale = context.locale;
    this.theme = context.theme;
    this.route = context.route;
  }

  render() {
    return renderDashboard.call(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.dispatchEvent(new CustomEvent('mfe:connected', {
      bubbles: true,
      composed: true,
      detail: { name: 'mfe-dashboard' },
    }));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
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
