import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { MfeContext } from '@lit-mf/shared';

@customElement('mfe-settings')
export class MfeSettings extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }
  `;

  private _context?: MfeContext;

  static mount(container: HTMLElement, context: MfeContext) {
    const el = document.createElement('mfe-settings');
    el._context = context;
    container.appendChild(el);

    return {
      unmount() {
        el.remove();
      },
    };
  }

  render() {
    const name = this._context?.config?.name ?? 'settings';
    return html`<h2>Settings MFE</h2><p>Context: ${name}</p>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mfe-settings': MfeSettings;
  }
}
