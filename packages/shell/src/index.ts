import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

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
    }
    .main-content {
      padding: 2rem;
      background: var(--color-background, #f5f5f5);
    }
  `;

  render() {
    return html`
      <div class="shell-layout">
        <nav class="sidebar">
          <h2>MFE Shell</h2>
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
