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
    --font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-md: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
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
    --font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-md: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --border-radius: 4px;
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
  }
`;

export interface ThemeTokens {
  '--color-primary': string;
  '--color-primary-dark': string;
  '--color-primary-light': string;
  '--color-accent': string;
  '--color-background': string;
  '--color-surface': string;
  '--color-error': string;
  '--color-on-primary': string;
  '--color-on-surface': string;
  '--color-text-primary': string;
  '--color-text-secondary': string;
  '--font-family': string;
  '--font-size-xs': string;
  '--font-size-sm': string;
  '--font-size-md': string;
  '--font-size-lg': string;
  '--font-size-xl': string;
  '--font-weight-normal': string;
  '--font-weight-medium': string;
  '--font-weight-semibold': string;
  '--border-radius': string;
  '--spacing-xs': string;
  '--spacing-sm': string;
  '--spacing-md': string;
  '--spacing-lg': string;
  '--spacing-xl': string;
}

export const tokensLight: ThemeTokens = {
  '--color-primary': '#1976d2',
  '--color-primary-dark': '#1565c0',
  '--color-primary-light': '#42a5f5',
  '--color-accent': '#ff6f00',
  '--color-background': '#ffffff',
  '--color-surface': '#f5f5f5',
  '--color-error': '#d32f2f',
  '--color-on-primary': '#ffffff',
  '--color-on-surface': '#212121',
  '--color-text-primary': 'rgba(0, 0, 0, 0.87)',
  '--color-text-secondary': 'rgba(0, 0, 0, 0.6)',
  '--font-family': 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  '--font-size-xs': '0.75rem',
  '--font-size-sm': '0.875rem',
  '--font-size-md': '1rem',
  '--font-size-lg': '1.25rem',
  '--font-size-xl': '1.5rem',
  '--font-weight-normal': '400',
  '--font-weight-medium': '500',
  '--font-weight-semibold': '600',
  '--border-radius': '4px',
  '--spacing-xs': '4px',
  '--spacing-sm': '8px',
  '--spacing-md': '16px',
  '--spacing-lg': '24px',
  '--spacing-xl': '32px',
};

export const tokensDark: ThemeTokens = {
  '--color-primary': '#90caf9',
  '--color-primary-dark': '#42a5f5',
  '--color-primary-light': '#bbdefb',
  '--color-accent': '#ffb74d',
  '--color-background': '#121212',
  '--color-surface': '#1e1e1e',
  '--color-error': '#ef5350',
  '--color-on-primary': '#000000',
  '--color-on-surface': '#ffffff',
  '--color-text-primary': 'rgba(255, 255, 255, 0.87)',
  '--color-text-secondary': 'rgba(255, 255, 255, 0.6)',
  '--font-family': 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  '--font-size-xs': '0.75rem',
  '--font-size-sm': '0.875rem',
  '--font-size-md': '1rem',
  '--font-size-lg': '1.25rem',
  '--font-size-xl': '1.5rem',
  '--font-weight-normal': '400',
  '--font-weight-medium': '500',
  '--font-weight-semibold': '600',
  '--border-radius': '4px',
  '--spacing-xs': '4px',
  '--spacing-sm': '8px',
  '--spacing-md': '16px',
  '--spacing-lg': '24px',
  '--spacing-xl': '32px',
};

export function getThemeTokens(theme: 'light' | 'dark'): ThemeTokens {
  return theme === 'dark' ? tokensDark : tokensLight;
}

export function tokensToStyleString(tokens: ThemeTokens): string {
  return Object.entries(tokens)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}
