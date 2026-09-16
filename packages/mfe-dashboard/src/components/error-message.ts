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
      background: var(--color-error-background);
      border: 1px solid var(--color-error-border);
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
      color: var(--color-error-title);
    }

    .error-text {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      color: var(--color-error-text);
    }

    .retry-button {
      padding: 0.5rem 1rem;
      background: var(--color-error-action);
      color: var(--color-on-primary);
      border: none;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .retry-button:hover {
      background: var(--color-error-action-hover);
    }

    .retry-button:focus {
      outline: 2px solid var(--color-error-focus);
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
