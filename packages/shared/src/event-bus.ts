import type { EventBus } from './types';

export function createEventBus(): EventBus {
  return {
    publish(topic: string, data?: unknown) {
      const event = new CustomEvent(topic, { detail: data });
      document.dispatchEvent(event);
    },

    subscribe(topic: string, handler: (data: unknown) => void) {
      const listener = (event: Event) => {
        const customEvent = event as CustomEvent;
        handler(customEvent.detail);
      };

      document.addEventListener(topic, listener);

      return () => {
        document.removeEventListener(topic, listener);
      };
    },
  };
}
