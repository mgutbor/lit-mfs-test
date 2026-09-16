import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('orders-skeleton')
export class OrdersSkeleton extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .skeleton-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: var(--color-surface);
      border-radius: 4px;
    }

    .skeleton {
      background: linear-gradient(
        90deg,
        var(--color-skeleton-base) 25%,
        var(--color-skeleton-shine) 50%,
        var(--color-skeleton-base) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-checkbox {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .skeleton-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .skeleton-text {
      height: 16px;
      flex: 1;
    }

    .skeleton-text.short {
      flex: 0 0 120px;
    }

    .skeleton-text.medium {
      flex: 0 0 200px;
    }

    .skeleton-badge {
      width: 80px;
      height: 24px;
      border-radius: 12px;
      flex-shrink: 0;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `;

  render() {
    return html`
      <div class="skeleton-container">
        ${Array.from({ length: 5 }, () => html`
          <div class="skeleton-row">
            <div class="skeleton skeleton-checkbox"></div>
            <div class="skeleton skeleton-avatar"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text medium"></div>
            <div class="skeleton skeleton-badge"></div>
          </div>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'orders-skeleton': OrdersSkeleton;
  }
}
