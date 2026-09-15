import { LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { MfeContext } from '@lit-mf/shared';
import { renderSettings } from './settings-view';

const STORAGE_KEY = 'mfe-settings:theme';

@customElement('mfe-settings')
export class MfeSettings extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }

    .settings {
      max-width: 400px;
    }

    .settings h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      color: var(--color-primary, #1976d2);
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--color-surface, #e0e0e0);
    }

    .setting-item label {
      font-weight: 500;
      color: var(--color-on-surface, #212121);
    }

    .setting-value {
      color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
    }

    .theme-toggle {
      padding: 0.5rem 1rem;
      border: 1px solid var(--color-primary, #1976d2);
      border-radius: var(--border-radius, 4px);
      background: transparent;
      color: var(--color-primary, #1976d2);
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .theme-toggle:hover {
      background: var(--color-primary, #1976d2);
      color: var(--color-on-primary, #ffffff);
    }
  `;

  @property({ type: String })
  locale = 'es';

  @property({ type: String })
  theme: 'light' | 'dark' = 'light';

  @property({ type: String })
  route = '/';

  static mount(container: HTMLElement, context: MfeContext) {
    const el = document.createElement('mfe-settings');
    el.theme = context.theme;
    el.locale = context.locale;
    el.route = context.route;

    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      el.theme = savedTheme;
    }

    container.appendChild(el);

    return {
      unmount() {
        el.remove();
      },
    };
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.theme = newTheme;
    localStorage.setItem(STORAGE_KEY, newTheme);

    this.dispatchEvent(new CustomEvent('mfe-settings:theme-changed', {
      detail: { theme: newTheme },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return renderSettings.call(this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mfe-settings': MfeSettings;
  }
}
