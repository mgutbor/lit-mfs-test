import type { ConfigMap, EndpointConfig } from '@lit-mf/shared';

const HTTP_METHODS = new Set<EndpointConfig['method']>([
  'GET',
  'POST',
  'PUT',
  'DELETE',
]);

const DEFAULT_ALLOWED_ORIGINS = ['https://dummyjson.com'];

export interface ConfigValidationOptions {
  allowedOrigins?: readonly string[];
  requiredMfes?: readonly ('mfe-dashboard' | 'mfe-settings')[];
}

export class ConfigMapValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid config map: ${issues.join('; ')}`);
    this.name = 'ConfigMapValidationError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateBaseUrl(
  value: unknown,
  path: string,
  issues: string[],
  allowedOrigins: readonly string[],
  allowEmpty: boolean,
): void {
  if (typeof value !== 'string' || (value === '' && !allowEmpty)) {
    issues.push(`${path} must be a non-empty HTTP(S) URL`);
    return;
  }

  if (value === '' && allowEmpty) return;

  if (!isValidHttpUrl(value)) {
    issues.push(`${path} must be an HTTP(S) URL`);
    return;
  }

  const origin = new URL(value).origin;
  if (!allowedOrigins.includes(origin)) {
    issues.push(`${path} origin is not allowed: ${origin}`);
  }
}

function validateEndpoint(
  value: unknown,
  path: string,
  issues: string[],
): void {
  if (!isRecord(value)) {
    issues.push(`${path} must be an object`);
    return;
  }

  if (typeof value.endpoint !== 'string' || !value.endpoint.startsWith('/')) {
    issues.push(`${path}.endpoint must be a relative path starting with /`);
  }

  if (typeof value.method !== 'string' || !HTTP_METHODS.has(value.method as EndpointConfig['method'])) {
    issues.push(`${path}.method must be GET, POST, PUT or DELETE`);
  }

  if (
    typeof value.timeout !== 'number'
    || !Number.isFinite(value.timeout)
    || value.timeout <= 0
    || value.timeout > 60_000
  ) {
    issues.push(`${path}.timeout must be a number between 1 and 60000`);
  }

  if (value.headers !== undefined) {
    if (!isRecord(value.headers)) {
      issues.push(`${path}.headers must be an object`);
    } else if (Object.values(value.headers).some((header) => typeof header !== 'string')) {
      issues.push(`${path}.headers values must be strings`);
    }
  }
}

function validateMfeConfig(
  value: unknown,
  path: string,
  issues: string[],
  allowedOrigins: readonly string[],
): void {
  if (!isRecord(value)) {
    issues.push(`${path} must be an object`);
    return;
  }

  if (typeof value.name !== 'string' || value.name.trim() === '') {
    issues.push(`${path}.name must be a non-empty string`);
  }

  validateBaseUrl(value.baseUrl, `${path}.baseUrl`, issues, allowedOrigins, false);

  if (!isRecord(value.endpoints) || Object.keys(value.endpoints).length === 0) {
    issues.push(`${path}.endpoints must contain at least one endpoint`);
    return;
  }

  for (const [endpointName, endpoint] of Object.entries(value.endpoints)) {
    validateEndpoint(endpoint, `${path}.endpoints.${endpointName}`, issues);
  }
}

export function validateConfigMap(
  value: unknown,
  options: ConfigValidationOptions = {},
): ConfigMap {
  const issues: string[] = [];
  const allowedOrigins = options.allowedOrigins ?? DEFAULT_ALLOWED_ORIGINS;
  const requiredMfes = options.requiredMfes ?? ['mfe-dashboard', 'mfe-settings'];

  if (!isRecord(value)) {
    throw new ConfigMapValidationError(['root must be an object']);
  }

  if (typeof value.version !== 'string' || value.version.trim() === '') {
    issues.push('version must be a non-empty string');
  }

  validateBaseUrl(value.baseUrl, 'baseUrl', issues, allowedOrigins, true);

  for (const mfeName of requiredMfes) {
    if (!(mfeName in value)) {
      issues.push(`${mfeName} is required`);
      continue;
    }

    validateMfeConfig(value[mfeName], mfeName, issues, allowedOrigins);
  }

  if (issues.length > 0) {
    throw new ConfigMapValidationError(issues);
  }

  return value as unknown as ConfigMap;
}
