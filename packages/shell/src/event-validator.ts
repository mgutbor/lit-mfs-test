export interface ThemeChangedEvent {
  theme: 'light' | 'dark';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isThemeChangedEvent(value: unknown): value is ThemeChangedEvent {
  return isRecord(value) && (value.theme === 'light' || value.theme === 'dark');
}

export function validateEvent(topic: string, detail: unknown): boolean {
  switch (topic) {
    case 'mfe-settings:theme-changed':
    case 'shell:theme-changed':
      return isThemeChangedEvent(detail);
    default:
      return true;
  }
}
