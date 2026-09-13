/**
 * @file STIC ButtonV2Base, Valores por defecto CSS
 *
 * @author STIC Arquitectura
 *
 * @version 1.71.0
 *
 * @namespace SticButtonV2
 */

import { css, CSSResult, CSSResultOrNative } from 'lit';

/**
 *
 * @element stic-button-v2-base
 *
 * @class SticButtonV2Theme
 *
 * @cssprop {string} [--button-color-focus-ring] - Define el color del focus ring del botón.
 *
 * @classdesc Clase usada para establecer los valores base de las variables e<br>
 * integrarlos con los conjuntos definidos para WCSticButtonV2.
 */

export class SticButtonV2Theme {
  static cssBase: CSSResult = css`
    :host {
      display: inline-block;
      position: relative;
      cursor: pointer;
    }
    :host([disabled]),
    :host([loading]) {
      cursor: not-allowed;
    }
    :host([disabled]) .container {
      pointer-events: none;
    }
    :host([disabled]) .container,
    :host([loading]) .container {
      pointer-events: none;
      --stic-text-color: var(--color-text-action-disabled);
    }
    :host([fullwidth]) {
      width: 100%;
      display: block;
    }
    :host([fullwidth]) .container {
      width: 100%;
    }
    stic-badge {
      position: absolute;
      left: calc(100% - 10px);
      bottom: calc(100% - 10px);
    }
    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--stic-button-v2-font-size, var(--font-size-lg));
      text-transform: var(--font-text-case-none);
      font-family: var(--font-family-primary);
      font-weight: var(--font-weight-medium);
      line-height: var(--stic-button-v2-line-height, var(--font-line-height-lg));
      letter-spacing: var(--font-letter-spacing-none);
      text-decoration: var(--font-text-decoration-none);
      position: relative;
      border-radius: var(--shape-sm);
      border: none;
      outline: none;
      cursor: pointer;

      border-top-left-radius: var(--stic-button-v2-border-top-left-radius, var(--shape-sm));
      border-bottom-left-radius: var(--stic-button-v2-border-bottom-left-radius, var(--shape-sm));
      border-top-right-radius: var(--stic-button-v2-border-top-right-radius, var(--shape-sm));
      border-bottom-right-radius: var(--stic-button-v2-border-bottom-right-radius, var(--shape-sm));
    }

    .container.sm {
      height: var(--sizing-height-4xl);
    }
    .container.md {
      height: var(--sizing-height-6xl);
    }
    .container.lg {
      height: var(--sizing-height-8xl);
    }

    .container.text {
      min-width: var(--sizing-width-18xl);
      max-width: 300px;
    }

    :host([fullwidth]) .container.text {
      max-width: none;
    }

    .container:hover .state-layer {
      cursor: pointer;
    }

    .container:hover:disabled .state-layer {
      opacity: var(--opacity-none);
    }

    .container:focus-visible {
      outline-offset: var(--spacing-xxxxs);
    }
    .state-layer {
      position: absolute;
      width: 100%;
      height: 100%;

      --stic-ripple-hover-opacity: var(--state-layer-hovered);
      --stic-ripple-focus-opacity: var(--state-layer-focused);
      --stic-ripple-press-opacity: var(--state-layer-pressed);
      --stic-ripple-z-index: var(--z-index-xxs);
      --stic-ripple-shape: var(--shape-sm);
      --stic-ripple-shape-top-left: var(--stic-button-v2-ripple-shape-top-left, var(--shape-sm));
      --stic-ripple-shape-top-right: var(--stic-button-v2-ripple-shape-top-right, var(--shape-sm));
      --stic-ripple-shape-bottom-left: var(
        --stic-button-v2-ripple-shape-bottom-left,
        var(--shape-sm)
      );
      --stic-ripple-shape-bottom-right: var(
        --stic-button-v2-ripple-shape-bottom-right,
        var(--shape-sm)
      );
    }

    .container .content {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container:disabled .content {
      color: var(--color-text-action-disabled);
      --stic-icon-fill-color: var(--color-text-action-disabled);
    }
    .container.sm .content.text {
      padding: var(--spacing-inset-squish-sm);
    }
    .container.md .content.text {
      padding: var(--spacing-inset-squish-md);
    }
    .container.lg .content.text {
      padding: var(--spacing-inset-squish-xl);
    }

    .container .content.text.icon {
      gap: var(--spacing-inline-sm);
    }
    :host(:not([loading])) .container.sm .content.text.icon {
      padding: var(--spacing-inset-squish-left-sm);
    }
    :host(:not([loading])) .container.md .content.text.icon {
      padding: var(--spacing-inset-squish-left-md);
    }
    :host(:not([loading])) .container.lg .content.text.icon {
      padding: var(--spacing-inset-squish-left-lg);
    }

    :host(:not([fullwidth])).container.icon.sm:not(.text) {
      width: var(--sizing-width-4xl);
    }
    :host(:not([fullwidth])).container.icon.md:not(.text) {
      width: var(--sizing-width-6xl);
    }
    :host(:not([fullwidth])).container.icon.lg:not(.text) {
      width: var(--sizing-width-8xl);
    }
  `;

  static sticButtonV2Theme: CSSResultOrNative[] = [SticButtonV2Theme.cssBase];
}
