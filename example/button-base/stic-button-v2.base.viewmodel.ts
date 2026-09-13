/**
 * @file STIC ButtonBase, Patron MVVM -> ViewModel
 *
 * @author STIC Arquitectura
 *
 * @version 1.71.0
 *
 * @namespace SticButtonV2
 */

import { isNotNull, isNotStringEmpty, isStringEmpty, typeCheck } from '@sas/lib-stic-kernel';
import { SticBadgeSizeType, SticBadgeVariantType } from '@sas/wc-stic-badge';
import { FontType } from '@sas/wc-stic-icon';
import {
  SticMWCRippleAddEventListener,
  SticMWCRippleHandler,
  SticMWCRippleRemoveEventListener,
  SticRippleView,
} from '@sas/wc-stic-ripple';
import { LitElement } from 'lit';
import { property, queryAsync } from 'lit/decorators.js';
import { ClassInfo } from 'lit/directives/class-map';
import {
  SticButtonV2ClickEvent,
  SticButtonV2ClickEventData,
} from './event/stic-button-v2-click.event';
import { ButtonSize } from './model/stic-button.model';

/**
 *
 * @element stic-button-v2-base
 *
 * @class SticButtonV2BaseViewModel
 *
 * @classdesc El view model automatiza la comunicación entre el view y el model.<br>
 * Elemento del componente encargado de gestionar las propiedades y la lógica visual.
 *
 * @prop {string} [label=''] - Texto del botón
 * @prop {ButtonSize} [size='sm'] - Tamaño del botón.
 * @prop {string} [title] - Título del botón.
 * @prop {string} [icon] - Icono incluido en el botón. Se puede usar la propiedad `label` o `icon` para establecer `aria-label`.
 * @prop {string} [iconFilled=false] - Si el icono es de Material, establece la propiedad `filled` al icono.
 * @prop {boolean} [loading] - Activa el cargando en el componente.
 * @prop {boolean} [disabled] - Establece el estado deshabilitado en el botón.
 * @prop {boolean} [activated=false] - Establece el estado activado en el botón.
 * @prop {string} [badgeContent=''] - Establece el contenido del badge del botón.
 * @prop {SticBadgeSizeType} [badgeSize='sm'] - Define el tamaño del badge. Sus valores pueden ser `sm`y `lg`.
 * @prop {SticBadgeVariantType} [badgeVariant='info'] - Establece el estilo visual (variante) del badge. Sus valores pueden ser 'info', 'warning', 'success', 'error', 'primary'.
 * @prop {boolean} [fullWidth=false] - Establece el tamaño del boton al 100% de su contenedor.
 *
 * @extends LitElement
 */

export class SticButtonV2BaseViewModel extends LitElement {
  @property({ type: String })
  public label: string = '';
  @property({ type: String })
  public size: ButtonSize = 'sm';
  @property({ type: String })
  public title!: string;
  @property({ type: String })
  public icon!: string;
  @property({ type: Boolean, reflect: true })
  public iconFilled: boolean = false;
  @property({ type: Boolean, reflect: true })
  public loading!: boolean;
  @property({ type: Boolean, reflect: true })
  public disabled!: boolean;
  @property({ type: Boolean, reflect: true })
  public activated: boolean = false;
  @property({ type: String, attribute: 'badge-content' }) public badgeContent: string = '';
  @property({ type: String, attribute: 'badge-variant' })
  public badgeVariant: SticBadgeVariantType = 'info';
  @property({ type: String, attribute: 'badge-size' })
  public badgeSize: SticBadgeSizeType = 'lg';
  @property({ type: String }) public iconFontType!: FontType;
  @property({ type: Boolean, reflect: true })
  public fullWidth: boolean = false;

  @queryAsync('stic-ripple')
  protected sticRipple!: Promise<SticRippleView | null>;

  protected rippleHandlers = new SticMWCRippleHandler(() => this.sticRipple);

  connectedCallback(): void {
    super.connectedCallback();
    SticMWCRippleAddEventListener(this, this.rippleHandlers);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    SticMWCRippleRemoveEventListener(this, this.rippleHandlers);
  }

  protected getContainerClasses(): ClassInfo {
    return {
      text: isNotStringEmpty(this.label),
      icon: this.hasIcon(),
      sm: isStringEmpty(this.size) || this.size === 'sm',
      md: this.size === 'md',
      lg: this.size === 'lg',
    };
  }
  protected getStateLayerClasses(): ClassInfo {
    return {};
  }
  protected getContentLayerClasses(): ClassInfo {
    return {
      text: isNotStringEmpty(this.label),
      icon: this.hasIcon(),
    };
  }
  protected hasIcon(): boolean {
    if (typeCheck(this.icon).toLowerCase() === 'string') {
      return isNotStringEmpty(this.icon);
    }
    return isNotNull(this.icon);
  }
  protected clickHandler(e: Event) {
    if (this.disabled || this.loading) return;
    this.dispatchEvent(
      new SticButtonV2ClickEvent(new SticButtonV2ClickEventData(this.label ?? ''))
    );
  }
}
