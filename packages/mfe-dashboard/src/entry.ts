import type { MfeContext } from '@lit-mf/shared';
import './mfe-dashboard.viewmodel';

export function mount(container: HTMLElement, context: MfeContext): () => void {
  const el = document.createElement('mfe-dashboard');
  el.setContext(context);
  container.appendChild(el);

  return () => {
    el.remove();
  };
}

export function unmount(): void {
  // Cleanup if needed
}
