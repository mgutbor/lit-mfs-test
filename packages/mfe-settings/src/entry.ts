import { createNamespacedStorage } from '@lit-mf/shared';
import type { MfeContext } from '@lit-mf/shared';
import './index';

export function mount(container: HTMLElement, context: MfeContext): () => void {
  const el = document.createElement('mfe-settings');
  el.theme = context.theme;
  el.locale = context.locale;
  el.route = context.route;

  const savedTheme = createNamespacedStorage('mfe-settings').getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    el.theme = savedTheme;
  }

  container.appendChild(el);

  return () => {
    el.remove();
  };
}

export function unmount(): void {
  // Cleanup if needed
}
