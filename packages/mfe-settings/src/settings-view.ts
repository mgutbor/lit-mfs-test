import { html } from 'lit';
import type { MfeSettings } from './index';

export function renderSettings(this: MfeSettings) {
  return html`
    <div class="settings">
      <h2>Settings</h2>

      <div class="setting-item">
        <label>
          Tema: ${this.theme === 'light' ? 'Claro' : 'Oscuro'}
        </label>
        <button
          class="theme-toggle"
          type="button"
          aria-label="Cambiar tema"
          @click=${this.toggleTheme}
        >
          ${this.theme === 'light' ? '🌙 Cambiar a oscuro' : '☀️ Cambiar a claro'}
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
