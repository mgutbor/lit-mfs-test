import { html } from 'lit';
import type { MfeSettings } from './index';

export function renderSettings(this: MfeSettings) {
  return html`
    <div class="settings">
      <h2>Settings</h2>

      <div class="setting-item">
        <label>Tema</label>
        <button class="theme-toggle" @click=${this.toggleTheme}>
          ${this.theme === 'light' ? '🌙 Oscuro' : '☀️ Claro'}
        </button>
      </div>

      <div class="setting-item">
        <label>Idioma</label>
        <span class="setting-value">${this.locale}</span>
      </div>

      <div class="setting-item">
        <label>Ruta actual</label>
        <span class="setting-value">${this.route}</span>
      </div>
    </div>
  `;
}
