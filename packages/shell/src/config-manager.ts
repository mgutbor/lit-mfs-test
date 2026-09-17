import type { ConfigMap, MfeConfig } from '@lit-mf/shared';
import { validateConfigMap } from './config-validator';

export type ConfigMapFetcher = () => Promise<unknown>;

export const EMPTY_CONFIG_MAP: ConfigMap = {
  version: '1.0.0',
  baseUrl: '',
};

export async function loadConfigMap(
  fetcher: ConfigMapFetcher = async () => {
    const response = await fetch('/config-map.json');
    if (!response.ok) {
      throw new Error(`Failed to load config map: ${response.status}`);
    }
    return response.json();
  },
): Promise<ConfigMap> {
  return validateConfigMap(await fetcher());
}

const MFE_CONFIG_KEYS: Record<string, 'mfe-dashboard' | 'mfe-settings'> = {
  '@lit-mf/dashboard': 'mfe-dashboard',
  '@lit-mf/settings': 'mfe-settings',
};

export function getMfeConfig(
  configMap: ConfigMap | null,
  mfeSpecifier: string,
): MfeConfig | undefined {
  if (!configMap) return undefined;
  const configKey = MFE_CONFIG_KEYS[mfeSpecifier];
  return configKey ? configMap[configKey] : undefined;
}

export function createMfeFallbackConfig(
  configMap: ConfigMap | null,
  mfeSpecifier: string,
): MfeConfig {
  return getMfeConfig(configMap, mfeSpecifier) ?? {
    name: mfeSpecifier,
    baseUrl: configMap?.baseUrl ?? '',
    endpoints: {},
  };
}
