import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('error-message')
export class ErrorMessage extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .error-container {
      padding: 1rem;
      background: var(--error-bg, #fee2e2);
      border: 1px solid var(--error-border, #fecaca);
      border-radius: 8px;
      text-align: center;
    }

    .error-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .error-title {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--error-title, #991b1b);
    }

    .error-text {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      color: var(--error-text, #b91c1c);
    }

    .retry-button {
      padding: 0.5rem 1rem;
      background: var(--error-button-bg, #dc2626);
      color: var(--error-button-text, #ffffff);
      border: none;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .retry-button:hover {
      background: var(--error-button-hover, #b91c1c);
    }

    .retry-button:focus {
      outline: 2px solid var(--error-focus, #f87171);
      outline-offset: 2px;
    }
  `;

  @property({ attribute: false })
  error: Error | null = null;

  private handleRetry() {
    this.dispatchEvent(new CustomEvent('retry', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const message = this.error?.message ?? 'Error desconocido';

    return html`
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Error al cargar datos</h3>
        <p class="error-text">${message}</p>
        <button class="retry-button" @click=${this.handleRetry}>
          Reintentar
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'error-message': ErrorMessage;
  }
}
