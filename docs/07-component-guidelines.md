# Guía de arquitectura de componentes

Patrones, convenciones y estructura que siguen todos los componentes del proyecto.

## Patrón MVVM

Todos los componentes siguen el patrón **Model-View-ViewModel**:

```
LitElement (Lit)
  └── ViewModel  (lógica + propiedades reactivas)
        └── View  (template HTML)
```

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| **Model** | `model/*.model.ts` | Tipos de dominio puros (types, interfaces). Sin dependencias de Lit ni UI |
| **ViewModel** | `*.viewmodel.ts` | Propiedades reactivas, lógica de negocio, handlers, dispatch de eventos. Extiende `LitElement` |
| **View** | `*.view.ts` | Template HTML, composición de sub-componentes. Extiende el ViewModel, solo renderiza |

**Regla:** La View no tiene lógica de negocio. El ViewModel no tiene template. El Model no tiene dependencias de UI.

---

## Estructura de carpetas

```
mfe-component/
├── mfe-{name}.view.ts           # Template (solo rendering)
├── mfe-{name}.viewmodel.ts      # Lógica + propiedades reactivas
├── css/
│   └── mfe-{name}-theme.css.ts  # Estilos como clase TypeScript
├── event/
│   └── mfe-{name}-{action}.event.ts  # Eventos custom tipados
└── model/
    └── mfe-{name}.model.ts      # Tipos de dominio
```

**Reglas:**
- Los archivos raíz son solo `.view.ts` y `.viewmodel.ts`
- Los subdirectorios solo existen si el componente necesita esos assets
- Un componente sin eventos no crea `event/`
- Un componente sin tipos propios no crea `model/`

---

## Naming conventions

### Archivos

```
{namespace}-{component}.{layer}.ts           → mfe-dashboard-chart.view.ts
{namespace}-{component}.{layer}.ts           → mfe-dashboard-chart.viewmodel.ts
{namespace}-{component}-{subtipo}.css.ts     → mfe-dashboard-chart-theme.css.ts
{namespace}-{component}-{accion}.event.ts    → mfe-dashboard-chart-zoom.event.ts
{namespace}-{component}.model.ts             → mfe-dashboard-chart.model.ts
```

### Clases

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| View | `{Name}View` | `MfeDashboardChartView` |
| ViewModel | `{Name}ViewModel` | `MfeDashboardChartViewModel` |
| Theme | `{Name}Theme` | `MfeDashboardChartTheme` |
| Event | `{Name}{Action}Event` | `MfeDashboardChartZoomEvent` |
| EventData | `{Name}{Action}EventData` | `MfeDashboardChartZoomEventData` |
| Model/Type | `{Name}` | `ChartSize`, `ChartType` |

### Custom Element

```
mfe-dashboard-chart     → kebab-case, registra el custom element
```

### Eventos

```
"chart:zoom"            → formato "component:action"
"chart:data-loaded"
"chart:filter-changed"
```

---

## ViewModel

El ViewModel es la pieza central. Extiende `LitElement` directamente y contiene toda la lógica.

### Propiedades reactivas

```ts
import { LitElement } from 'lit';
import { property, queryAsync } from 'lit/decorators.js';

export class MfeChartViewModel extends LitElement {

  // Propiedad básica
  @property({ type: String })
  public label: string = '';

  // Propiedad con reflect (sincroniza con atributo HTML para CSS selectors)
  @property({ type: Boolean, reflect: true })
  public disabled!: boolean;

  // Propiedad camelCase → atributo kebab-case
  @property({ type: String, attribute: 'chart-type' })
  public chartType: string = 'bar';

  // Query asíncrono (para elementos que pueden no estar en el DOM inmediatamente)
  @queryAsync('my-child-component')
  protected childComponent!: Promise<MyChildComponent | null>;
}
```

**Reglas de `@property`:**
- Usar `reflect: true` cuando el atributo se usa en CSS: `:host([disabled])`
- Usar `attribute: 'kebab-case'` cuando la propiedad es camelCase pero el HTML usa kebab-case
- Usar `!` (non-null assertion) para propiedades sin valor por defecto

### Lifecycle hooks

```ts
connectedCallback(): void {
  super.connectedCallback();
  // Registrar event listeners, suscripciones, etc.
}

disconnectedCallback(): void {
  super.disconnectedCallback();
  // Limpiar event listeners, suscripciones, etc.
}
```

**Regla:** Siempre llamar a `super.*()` primero. Registrar en `connected`, limpiar en `disconnected`.

### Métodos de clases CSS

```ts
import { ClassInfo } from 'lit/directives/class-map';

protected getContainerClasses(): ClassInfo {
  return {
    'is-active': this.active,
    'is-loading': this.loading,
    'size-sm': this.size === 'sm',
    'size-md': this.size === 'md',
    'size-lg': this.size === 'lg',
  };
}

protected getContentClasses(): ClassInfo {
  return {
    'has-icon': this.hasIcon(),
    'has-label': this.hasLabel(),
  };
}
```

**Regla:** Toda la lógica de clases condicionales está en el ViewModel, no en el template.

### Handlers de eventos

```ts
protected clickHandler(e: Event) {
  if (this.disabled || this.loading) return;
  
  this.dispatchEvent(
    new MfeChartClickEvent(
      new MfeChartClickEventData(this.chartId)
    )
  );
}
```

**Regla:** Los handlers validan estado antes de despachar. El despacho usa clases tipadas (no `CustomEvent` directamente).

---

## View

La View extiende el ViewModel y solo implementa rendering.

### Render principal

```ts
import { html, nothing, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { until } from 'lit/directives/until.js';
import { whenTrue } from '@sas/lib-stic-kernel';

export class MfeChartView extends MfeChartViewModel {

  render() {
    return html`
      <div class="chart ${classMap(this.getContainerClasses())}">
        ${this.renderHeader()}
        ${this.renderContent()}
        ${this.renderFooter()}
      </div>
    `;
  }
}
```

### Métodos render granulares

Cada capa visual es un método `render*()` separado:

```ts
protected renderHeader(): TemplateResult {
  return html`
    <div class="header">
      ${until(this.renderTitle())}
      ${until(this.renderActions())}
    </div>
  `;
}

protected renderContent(): TemplateResult {
  return html`
    <div class="content">
      ${this.loading 
        ? until(this.renderLoading()) 
        : until(this.renderChart())
      }
    </div>
  `;
}

protected renderFooter(): TemplateResult | typeof nothing {
  return whenTrue(this.showFooter, async () => {
    return html`<div class="footer">...</div>`;
  });
}
```

### Rendering async con `until()`

```ts
protected async renderChart(): Promise<TemplateResult> {
  await import('@sas/wc-stic-chart');
  return html`<stic-chart .data=${this.data}></stic-chart>`;
}
```

En el template:

```ts
${until(this.renderChart())}
```

`until()` muestra un placeholder mientras el Promise resuelve, evitando flash de contenido vacío.

### Rendering condicional con `whenTrue()`

```ts
protected async renderIcon(): Promise<TemplateResult | typeof nothing> {
  return whenTrue(this.icon, async () => {
    await import('@sas/wc-stic-icon');
    return html`<stic-icon .icon=${this.icon}></stic-icon>`;
  });
}
```

`whenTrue(condicion, callbackAsync)` ejecuta el callback solo si la condición es truthy. Si es falsy, retorna `nothing`.

### Clases condicionales con `classMap()`

```ts
html`<div class="container ${classMap(this.getContainerClasses())}">`
```

`classMap()` recibe un objeto `ClassInfo` y retorna el string de clases CSS correspondiente.

---

## CSS (Theme)

Los estilos se definen como una clase TypeScript con propiedades estáticas.

### Estructura

```ts
import { css, CSSResult, CSSResultOrNative } from 'lit';

export class MfeChartTheme {
  static cssBase: CSSResult = css`
    :host {
      display: block;
    }
    .container {
      border-radius: var(--mfe-chart-border-radius, var(--shape-md));
      padding: var(--mfe-chart-padding, var(--spacing-md));
    }
  `;

  static mfeChartTheme: CSSResultOrNative[] = [MfeChartTheme.cssBase];
}
```

### Inyección en la View

```ts
export class MfeChartView extends MfeChartViewModel {
  static finalizeStyles = (styles?: CSSResultGroup): CSSResultOrNative[] => [
    ...super.finalizeStyles(styles),
    ...MfeChartTheme.mfeChartTheme,
  ];
}
```

### CSS Custom Properties (tokens de diseño)

Patrón de fallback en dos niveles:

```css
/* Nivel 1: Variable específica del componente */
/* Nivel 2: Token del design system global */

font-size: var(--mfe-chart-font-size, var(--font-size-lg));
border-radius: var(--mfe-chart-border-radius, var(--shape-md));
color: var(--mfe-chart-text-color, var(--color-text-primary));
```

**Convención de nombres:**

```
--{namespace}-{component}-{propiedad}
```

Ejemplos:
- `--mfe-chart-font-size`
- `--mfe-chart-border-radius`
- `--mfe-chart-text-color`

**Por qué este patrón:**
- El consumidor puede hacer `--mfe-chart-font-size: 20px` y cambiar solo ese componente
- Si nadie override, usa el token del design system global
- El componente no depende de valores hardcodeados

### CSS para estados del host

```css
:host {
  display: inline-block;
  position: relative;
}

:host([disabled]),
:host([loading]) {
  cursor: not-allowed;
  pointer-events: none;
}

:host([fullwidth]) {
  width: 100%;
  display: block;
}
```

Usar selectores `:host([atributo])` para estados que se reflejan en el atributo HTML.

---

## Eventos

Cada evento tiene dos clases: el `Event` y el `EventData`.

### EventData (datos inmutables)

```ts
export class MfeChartZoomEventData {
  private _scale: number;
  private _origin: string;

  constructor(scale: number, origin: string) {
    this._scale = scale;
    this._origin = origin;
  }

  public get scale(): number {
    return this._scale;
  }

  public get origin(): string {
    return this._origin;
  }
}
```

**Regla:** Datos inmutables con getters. Sin setters. Se crean en el constructor.

### Event (extiende BaseCustomEvent)

```ts
import { BaseCustomEvent } from '@sas/lib-stic-kernel';

export class MfeChartZoomEvent extends BaseCustomEvent<MfeChartZoomEventData> {
  constructor(detail: MfeChartZoomEventData) {
    super('chart:zoom', detail);
  }
}
```

**Regla:** El nombre del evento usa formato `"component:action"`.

### Despacho en el ViewModel

```ts
protected handleZoom(scale: number) {
  this.dispatchEvent(
    new MfeChartZoomEvent(
      new MfeChartZoomEventData(scale, 'user-interaction')
    )
  );
}
```

**Regla:** El despacho siempre ocurre en el ViewModel, nunca en la View.

---

## Lazy loading de dependencias

Los sub-componentes se cargan dinámicamente justo antes de renderizarse.

### Patrón básico

```ts
protected async renderIcon(): Promise<TemplateResult | typeof nothing> {
  return whenTrue(this.icon, async () => {
    // 1. Importar dinámicamente el componente hijo
    await import('@sas/wc-stic-icon');
    
    // 2. Ahora sí, renderizarlo
    return html`
      <stic-icon
        .icon=${this.icon}
        ?filled=${this.iconFilled}
      ></stic-icon>
    `;
  });
}
```

### En el template

```ts
${until(this.renderIcon())}
```

### Patrón con loading state

```ts
protected renderContent(): TemplateResult {
  return html`
    <div class="content">
      ${this.loading 
        ? until(this.renderLoading()) 
        : html`
            ${until(this.renderChart())}
            ${until(this.renderLegend())}
          `
      }
    </div>
  `;
}

protected async renderLoading(): Promise<TemplateResult> {
  await import('@sas/wc-stic-progress-indicator');
  return html`<stic-progress-indicator-circle></stic-progress-indicator-circle>`;
}

protected async renderChart(): Promise<TemplateResult> {
  await import('@sas/wc-stic-chart');
  return html`<stic-chart .data=${this.data}></stic-chart>`;
}
```

**Ventajas:**
- Code splitting: cada `import()` crea un chunk separado
- Un botón sin icono no carga el módulo de icon
- Performance: solo carga lo que necesita

---

## Ejemplo completo: mfe-data-card

### Estructura de archivos

```
mfe-data-card/
├── mfe-data-card.view.ts
├── mfe-data-card.viewmodel.ts
├── css/
│   └── mfe-data-card-theme.css.ts
├── event/
│   └── mfe-data-card-select.event.ts
└── model/
    └── mfe-data-card.model.ts
```

### model/mfe-data-card.model.ts

```ts
export type CardSize = 'sm' | 'md' | 'lg';
export type CardVariant = 'default' | 'outlined' | 'elevated';
```

### event/mfe-data-card-select.event.ts

```ts
import { BaseCustomEvent } from '@sas/lib-stic-kernel';

export class MfeDataCardSelectEvent extends BaseCustomEvent<MfeDataCardSelectEventData> {
  constructor(detail: MfeDataCardSelectEventData) {
    super('data-card:select', detail);
  }
}

export class MfeDataCardSelectEventData {
  private _cardId: string;
  private _selected: boolean;

  constructor(cardId: string, selected: boolean) {
    this._cardId = cardId;
    this._selected = selected;
  }

  public get cardId(): string {
    return this._cardId;
  }

  public get selected(): boolean {
    return this._selected;
  }
}
```

### css/mfe-data-card-theme.css.ts

```ts
import { css, CSSResult, CSSResultOrNative } from 'lit';

export class MfeDataCardTheme {
  static cssBase: CSSResult = css`
    :host {
      display: block;
    }

    .card {
      display: flex;
      flex-direction: column;
      border-radius: var(--mfe-data-card-border-radius, var(--shape-md));
      padding: var(--mfe-data-card-padding, var(--spacing-md));
      background: var(--mfe-data-card-bg, var(--color-surface-primary));
      cursor: pointer;
      transition: box-shadow 0.2s ease;
    }

    .card:hover {
      box-shadow: var(--mfe-data-card-hover-shadow, var(--shadow-md));
    }

    :host([selected]) .card {
      border-color: var(--mfe-data-card-selected-border, var(--color-border-active));
    }

    :host([disabled]) .card {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .card.size-sm { height: var(--sizing-height-4xl); }
    .card.size-md { height: var(--sizing-height-6xl); }
    .card.size-lg { height: var(--sizing-height-8xl); }
  `;

  static mfeDataCardTheme: CSSResultOrNative[] = [MfeDataCardTheme.cssBase];
}
```

### mfe-data-card.viewmodel.ts

```ts
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { ClassInfo } from 'lit/directives/class-map';
import { MfeDataCardSelectEvent, MfeDataCardSelectEventData } from './event/mfe-data-card-select.event';
import { CardSize, CardVariant } from './model/mfe-data-card.model';

export class MfeDataCardViewModel extends LitElement {
  @property({ type: String })
  public cardId: string = '';

  @property({ type: String })
  public title: string = '';

  @property({ type: String })
  public description: string = '';

  @property({ type: String })
  public imageUrl: string = '';

  @property({ type: String })
  public size: CardSize = 'md';

  @property({ type: String })
  public variant: CardVariant = 'default';

  @property({ type: Boolean, reflect: true })
  public selected: boolean = false;

  @property({ type: Boolean, reflect: true })
  public disabled: boolean = false;

  @property({ type: Boolean, reflect: true })
  public loading: boolean = false;

  protected getCardClasses(): ClassInfo {
    return {
      'size-sm': this.size === 'sm',
      'size-md': this.size === 'md',
      'size-lg': this.size === 'lg',
      'variant-outlined': this.variant === 'outlined',
      'variant-elevated': this.variant === 'elevated',
    };
  }

  protected clickHandler(e: Event) {
    if (this.disabled || this.loading) return;

    this.selected = !this.selected;

    this.dispatchEvent(
      new MfeDataCardSelectEvent(
        new MfeDataCardSelectEventData(this.cardId, this.selected)
      )
    );
  }
}
```

### mfe-data-card.view.ts

```ts
import { html, nothing, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { until } from 'lit/directives/until.js';
import { whenTrue } from '@sas/lib-stic-kernel';
import { MfeDataCardTheme } from './css/mfe-data-card-theme.css';
import { MfeDataCardViewModel } from './mfe-data-card.viewmodel';

export class MfeDataCardView extends MfeDataCardViewModel {
  static finalizeStyles = (styles?) => [
    ...super.finalizeStyles(styles),
    ...MfeDataCardTheme.mfeDataCardTheme,
  ];

  render() {
    return html`
      <div
        class="card ${classMap(this.getCardClasses())}"
        @click=${this.clickHandler}
        ?selected=${this.selected}
        ?disabled=${this.disabled}
      >
        ${this.renderContent()}
      </div>
    `;
  }

  protected renderContent(): TemplateResult {
    return html`
      ${this.loading
        ? until(this.renderLoading())
        : html`
            ${until(this.renderImage())}
            ${this.renderText()}
          `
      }
    `;
  }

  protected async renderLoading(): Promise<TemplateResult> {
    await import('@sas/wc-stic-progress-indicator');
    return html`<stic-progress-indicator-circle></stic-progress-indicator-circle>`;
  }

  protected async renderImage(): Promise<TemplateResult | typeof nothing> {
    return whenTrue(this.imageUrl, async () => {
      await import('@sas/wc-stic-image');
      return html`
        <stic-image
          .src=${this.imageUrl}
          .alt=${this.title}
        ></stic-image>
      `;
    });
  }

  protected renderText(): TemplateResult {
    return html`
      <div class="text">
        <h3 class="title">${this.title}</h3>
        <p class="description">${this.description}</p>
      </div>
    `;
  }
}
```

### Registro del custom element

```ts
import { customElement } from 'lit/decorators.js';

@customElement('mfe-data-card')
export class MfeDataCard extends MfeDataCardView {}
```
