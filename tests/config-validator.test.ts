import { describe, expect, it } from 'vitest';
import {
  ConfigMapValidationError,
  validateConfigMap,
} from '../packages/shell/src/config-validator';

function createValidConfig() {
  return {
    version: '1.0.0',
    baseUrl: '',
    'mfe-dashboard': {
      name: 'mfe-dashboard',
      baseUrl: 'https://dummyjson.com',
      endpoints: {
        orders: {
          endpoint: '/todos',
          method: 'GET',
          timeout: 5000,
        },
      },
    },
    'mfe-settings': {
      name: 'mfe-settings',
      baseUrl: 'https://dummyjson.com',
      endpoints: {
        profile: {
          endpoint: '/users/1',
          method: 'GET',
          timeout: 3000,
        },
      },
    },
  };
}

describe('validateConfigMap', () => {
  it('accepts the current config-map contract', () => {
    expect(validateConfigMap(createValidConfig())).toMatchObject({
      version: '1.0.0',
      'mfe-dashboard': {
        baseUrl: 'https://dummyjson.com',
      },
    });
  });

  it('supports an explicit origin allowlist per environment', () => {
    const config = createValidConfig();
    config['mfe-dashboard'].baseUrl = 'https://api.example.com';
    config['mfe-settings'].baseUrl = 'https://api.example.com';

    expect(() => validateConfigMap(config)).toThrow(ConfigMapValidationError);
    expect(validateConfigMap(config, {
      allowedOrigins: ['https://api.example.com'],
    })).toBe(config);
  });

  it('rejects missing MFE sections and malformed endpoint definitions', () => {
    const config = createValidConfig();
    delete config['mfe-settings'];
    config['mfe-dashboard'].endpoints.orders = {
      endpoint: 'https://attacker.example.com/data',
      method: 'PATCH',
      timeout: 0,
    } as never;

    expect(() => validateConfigMap(config)).toThrowError(
      /relative path.*method.*between 1 and 60000.*mfe-settings is required/s,
    );
  });

  it('rejects origins outside the allowlist', () => {
    const config = createValidConfig();
    config['mfe-dashboard'].baseUrl = 'https://attacker.example.com';

    expect(() => validateConfigMap(config)).toThrowError(
      /origin is not allowed: https:\/\/attacker\.example\.com/,
    );
  });

  it('rejects invalid shapes and non-http origins', () => {
    const config = createValidConfig();
    config['mfe-settings'].baseUrl = 'javascript:alert(1)';
    config['mfe-settings'].endpoints.profile.timeout = 60_001;

    expect(() => validateConfigMap(config)).toThrowError(
      /must be an HTTP\(S\) URL.*between 1 and 60000/s,
    );
  });
});
