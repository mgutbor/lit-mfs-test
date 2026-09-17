import { describe, expect, it } from 'vitest';
import { createNamespacedStorage } from '../packages/shared/src/storage';

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
  };
}

describe('createNamespacedStorage', () => {
  it('prefixes keys and supports the storage lifecycle', () => {
    const storage = createMemoryStorage();
    const namespacedStorage = createNamespacedStorage('mfe-settings', storage);

    expect(namespacedStorage.getItem('theme')).toBeNull();

    namespacedStorage.setItem('theme', 'dark');

    expect(namespacedStorage.getItem('theme')).toBe('dark');
    expect(storage.getItem('mfe-settings:theme')).toBe('dark');
    expect(storage.getItem('theme')).toBeNull();

    namespacedStorage.removeItem('theme');

    expect(namespacedStorage.getItem('theme')).toBeNull();
    expect(storage.getItem('mfe-settings:theme')).toBeNull();
  });

  it('keeps different namespaces isolated', () => {
    const storage = createMemoryStorage();
    const settingsStorage = createNamespacedStorage('mfe-settings', storage);
    const dashboardStorage = createNamespacedStorage('mfe-dashboard', storage);

    settingsStorage.setItem('theme', 'dark');
    dashboardStorage.setItem('theme', 'light');

    expect(settingsStorage.getItem('theme')).toBe('dark');
    expect(dashboardStorage.getItem('theme')).toBe('light');
  });
});
