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
    --color-status-pending-background: #fff3e0;
    --color-status-pending-text: #e65100;
    --color-status-processing-background: #e3f2fd;
    --color-status-processing-text: #1565c0;
    --color-status-shipped-background: #e8f5e9;
    --color-status-shipped-text: #2e7d32;
    --color-status-delivered-background: #f3e5f5;
    --color-status-delivered-text: #7b1fa2;
    --color-skeleton-base: #e5e7eb;
    --color-skeleton-shine: #f3f4f6;
    --color-error-background: #fee2e2;
    --color-error-border: #fecaca;
    --color-error-title: #991b1b;
    --color-error-text: #b91c1c;
    --color-error-action: #dc2626;
    --color-error-action-hover: #b91c1c;
    --color-error-focus: #f87171;
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
    --color-status-pending-background: #4a2f0a;
    --color-status-pending-text: #ffcc80;
    --color-status-processing-background: #12304a;
    --color-status-processing-text: #90caf9;
    --color-status-shipped-background: #17351d;
    --color-status-shipped-text: #a5d6a7;
    --color-status-delivered-background: #352044;
    --color-status-delivered-text: #ce93d8;
    --color-skeleton-base: #374151;
    --color-skeleton-shine: #4b5563;
    --color-error-background: #4b1d1d;
    --color-error-border: #7f1d1d;
    --color-error-title: #fecaca;
    --color-error-text: #fca5a5;
    --color-error-action: #ef5350;
    --color-error-action-hover: #e57373;
    --color-error-focus: #ff8a80;
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
  '--color-status-pending-background': string;
  '--color-status-pending-text': string;
  '--color-status-processing-background': string;
  '--color-status-processing-text': string;
  '--color-status-shipped-background': string;
  '--color-status-shipped-text': string;
  '--color-status-delivered-background': string;
  '--color-status-delivered-text': string;
  '--color-skeleton-base': string;
  '--color-skeleton-shine': string;
  '--color-error-background': string;
  '--color-error-border': string;
  '--color-error-title': string;
  '--color-error-text': string;
  '--color-error-action': string;
  '--color-error-action-hover': string;
  '--color-error-focus': string;
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
  '--color-status-pending-background': '#fff3e0',
  '--color-status-pending-text': '#e65100',
  '--color-status-processing-background': '#e3f2fd',
  '--color-status-processing-text': '#1565c0',
  '--color-status-shipped-background': '#e8f5e9',
  '--color-status-shipped-text': '#2e7d32',
  '--color-status-delivered-background': '#f3e5f5',
  '--color-status-delivered-text': '#7b1fa2',
  '--color-skeleton-base': '#e5e7eb',
  '--color-skeleton-shine': '#f3f4f6',
  '--color-error-background': '#fee2e2',
  '--color-error-border': '#fecaca',
  '--color-error-title': '#991b1b',
  '--color-error-text': '#b91c1c',
  '--color-error-action': '#dc2626',
  '--color-error-action-hover': '#b91c1c',
  '--color-error-focus': '#f87171',
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
  '--color-status-pending-background': '#4a2f0a',
  '--color-status-pending-text': '#ffcc80',
  '--color-status-processing-background': '#12304a',
  '--color-status-processing-text': '#90caf9',
  '--color-status-shipped-background': '#17351d',
  '--color-status-shipped-text': '#a5d6a7',
  '--color-status-delivered-background': '#352044',
  '--color-status-delivered-text': '#ce93d8',
  '--color-skeleton-base': '#374151',
  '--color-skeleton-shine': '#4b5563',
  '--color-error-background': '#4b1d1d',
  '--color-error-border': '#7f1d1d',
  '--color-error-title': '#fecaca',
  '--color-error-text': '#fca5a5',
  '--color-error-action': '#ef5350',
  '--color-error-action-hover': '#e57373',
  '--color-error-focus': '#ff8a80',
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
