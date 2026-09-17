import { describe, expect, it, vi } from 'vitest';
import { createEventBus } from '../packages/shared/src/event-bus';
import { validateEvent } from '../packages/shell/src/event-validator';

describe('createEventBus', () => {
  it('publishes details to subscribers and supports unsubscribe', () => {
    const eventBus = createEventBus();
    const handler = vi.fn();
    const unsubscribe = eventBus.subscribe('test:event', handler);

    eventBus.publish('test:event', { value: 1 });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ value: 1 });

    unsubscribe();
    eventBus.publish('test:event', { value: 2 });
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe('validateEvent', () => {
  it('accepts valid theme events', () => {
    expect(validateEvent('mfe-settings:theme-changed', { theme: 'dark' })).toBe(true);
    expect(validateEvent('shell:theme-changed', { theme: 'light' })).toBe(true);
  });

  it('rejects invalid theme payloads', () => {
    expect(validateEvent('mfe-settings:theme-changed', { theme: 'auto' })).toBe(false);
    expect(validateEvent('shell:theme-changed', null)).toBe(false);
    expect(validateEvent('shell:theme-changed', { theme: 'dark', extra: true })).toBe(true);
  });

  it('allows unknown events for consumers that own their contracts', () => {
    expect(validateEvent('unknown:event', { arbitrary: true })).toBe(true);
  });
});
