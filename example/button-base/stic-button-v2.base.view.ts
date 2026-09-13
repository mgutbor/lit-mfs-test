/**
 * @file STIC ButtonV2Base, Patron MVVM -> View
 *
 * @author STIC Arquitectura
 *
 * @version 1.71.0
 *
 * @namespace SticButtonV2
 */

import { CSSResultGroup, CSSResultOrNative, html, nothing, TemplateResult } from 'lit';

import { whenTrue } from '@sas/lib-stic-kernel';
import { classMap } from 'lit/directives/class-map.js';
import { until } from 'lit/directives/until.js';
import { SticButtonV2Theme } from './css/stic-button-v2-base-theme.css';
import { SticButtonV2BaseViewModel } from './stic-button-v2.base.viewmodel';

/**
 *
 * @element stic-button-v2-base
 *
 * @class SticButtonV2BaseView
 *
 * @classdesc La Vista define cómo la información y las funcionalidades se mostrarán gráficamente.<br>
 * Tiene la responsabilidad de definir la estructura que saldrá de la pantalla del componente SticButtonV2.
 *
 * @extends SticButtonV2BaseViewModel
 */

export class SticButtonV2BaseView extends SticButtonV2BaseViewModel {
  static finalizeStyles = (styles?: CSSResultGroup): CSSResultOrNative[] => [
    ...super.finalizeStyles(styles),
    ...SticButtonV2Theme.sticButtonV2Theme,
  ];

  render() {
    return html`
      <button
        class="container ${classMap(this.getContainerClasses())}"
        .disabled=${this.disabled}
        .title=${this.title}
        @click=${this.clickHandler}
      >
        ${this.renderContent()}
      </button>
      ${until(this.renderBadge())}
    `;
  }
  protected async renderBadge(): Promise<TemplateResult | typeof nothing> {
    return whenTrue(this.badgeContent?.length > 0, async () => {
      await import('@sas/wc-stic-badge');
      return html`<stic-badge
        .label=${this.badgeContent}
        .size=${this.badgeSize}
        .variant=${this.badgeVariant}
      ></stic-badge>`;
    });
  }
  protected renderContent(): TemplateResult {
    return html`${this.renderStateLayer()}
      <div class="content ${classMap(this.getContentLayerClasses())}">
        ${this.loading ? until(this.renderLoading()) : this.renderContentLayer()}
      </div>`;
  }
  protected renderStateLayer(): TemplateResult {
    return html`<div class="state-layer ${classMap(this.getStateLayerClasses())}">
      ${until(this.renderRipple())}
    </div>`;
  }
  protected renderContentLayer(): TemplateResult {
    return html` ${until(this.renderIcon())} ${until(this.renderLabel())} `;
  }
  protected async renderRipple(): Promise<TemplateResult> {
    await import('@sas/wc-stic-ripple');
    return html` <stic-ripple
      class="ripple"
      ?primary="${false}"
      ?disabled=${this.disabled || this.loading}
    ></stic-ripple>`;
  }
  protected async renderLoading(): Promise<TemplateResult> {
    await import('@sas/wc-stic-progress-indicator');
    return html`<stic-progress-indicator-circle text=""></stic-progress-indicator-circle>`;
  }

  protected async renderLabel(): Promise<TemplateResult> {
    await import('@sas/wc-stic-text');
    return html`<stic-text text=${this.label} lineClamp="1" tooltipElipsis></stic-text>`;
  }
  protected async renderIcon(): Promise<TemplateResult | typeof nothing> {
    return whenTrue(this.icon, async () => {
      await import('@sas/wc-stic-icon');
      return html`<stic-icon
        .icon=${this.icon}
        ?filled=${this.iconFilled}
        .fontType=${this.iconFontType}
      ></stic-icon>`;
    });
  }
}
