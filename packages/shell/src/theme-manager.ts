import type { EventBus } from '@lit-mf/shared';
import { createNamespacedStorage, getThemeTokens } from '@lit-mf/shared';
import { validateEvent, type ThemeChangedEvent } from './event-validator';

export type Theme = 'light' | 'dark';

type ThemeTarget = HTMLElement;

const themeStorage = createNamespacedStorage('mfe-settings');

export function getInitialTheme(): Theme {
  return themeStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
}

export function applyThemeTokens(target: ThemeTarget, theme: Theme): void {
  const tokens = getThemeTokens(theme);
  Object.entries(tokens).forEach(([property, value]) => {
    target.style.setProperty(property, value);
  });
}

export interface ThemeManager {
  subscribe(): () => void;
  apply(theme: Theme): void;
}

export function createThemeManager(
  target: ThemeTarget,
  eventBus: EventBus,
  onThemeChanged: (theme: Theme) => void,
): ThemeManager {
  const apply = (theme: Theme) => {
    applyThemeTokens(target, theme);
    onThemeChanged(theme);
    eventBus.publish('shell:theme-changed', { theme });
  };

  return {
    subscribe() {
      return eventBus.subscribe('mfe-settings:theme-changed', (data) => {
        if (!validateEvent('mfe-settings:theme-changed', data)) {
          console.warn('Rejected invalid event: mfe-settings:theme-changed');
          return;
        }

        apply((data as ThemeChangedEvent).theme);
      });
    },
    apply,
  };
}
