import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { MfeContext } from '@lit-mf/shared';

@customElement('mfe-dashboard')
export class MfeDashboard extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }
  `;

  private _context?: MfeContext;

  static mount(container: HTMLElement, context: MfeContext) {
    const el = document.createElement('mfe-dashboard');
    el._context = context;
    container.appendChild(el);

    return {
      unmount() {
        el.remove();
      },
    };
  }

  render() {
    const locale = this._context?.locale ?? 'es';
    const theme = this._context?.theme ?? 'light';
    const route = this._context?.route ?? '/';
    return html`
      <h2>Dashboard MFE</h2>
      <p>Locale: ${locale}</p>
      <p>Theme: ${theme}</p>
      <p>Route: ${route}</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mfe-dashboard': MfeDashboard;
  }
}
