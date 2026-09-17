import type { EventBus, EventMap } from './types';

export function createEventBus<Events extends EventMap = EventMap>(): EventBus<Events> {
  return {
    publish(topic, ...data) {
      const event = new CustomEvent(topic, { detail: data[0] });
      document.dispatchEvent(event);
    },

    subscribe(topic, handler) {
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
