import { css } from 'lit';

export const themeLight = css`
  :host {
    --color-primary: #1976d2;
    --color-primary-dark: #1565c0;
    --color-primary-light: #42a5f5;
    --color-accent: #ff6f00;
    --color-background: #ffffff;
    --color-surface: #f5f5f5;
    --color-error: #d32f2f;
    --color-on-primary: #ffffff;
    --color-on-surface: #212121;
    --color-text-primary: rgba(0, 0, 0, 0.87);
    --color-text-secondary: rgba(0, 0, 0, 0.6);
    --border-radius: 4px;
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
  }
`;

export const themeDark = css`
  :host {
    --color-primary: #90caf9;
    --color-primary-dark: #42a5f5;
    --color-primary-light: #bbdefb;
    --color-accent: #ffb74d;
    --color-background: #121212;
    --color-surface: #1e1e1e;
    --color-error: #ef5350;
    --color-on-primary: #000000;
    --color-on-surface: #ffffff;
    --color-text-primary: rgba(255, 255, 255, 0.87);
    --color-text-secondary: rgba(255, 255, 255, 0.6);
    --border-radius: 4px;
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
  }
`;
