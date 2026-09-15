import type { MfeContext } from '@lit-mf/shared';
import './index';

export function mount(container: HTMLElement, context: MfeContext): () => void {
  const el = document.createElement('mfe-settings');
  (el as any)._context = context;
  container.appendChild(el);

  return () => {
    el.remove();
  };
}

export function unmount(): void {
  // Cleanup if needed
}
