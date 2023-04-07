import { getConfig } from '~/config';
import { createEnsureResourcePath } from '~/ensureResource';

export function registerDefaultPaths() {
  const config = getConfig();

  if (config.defaultPaths['ensure-resource']) {
    createEnsureResourcePath();
  }
}
