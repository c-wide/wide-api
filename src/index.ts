import { getConfig, validateConfig } from '~/getConfig';
import { startServer } from '~/startServer';
import { createEnsureResourcePath } from '~/ensureResource';
import { compareResourceVersion } from '~/versionChecker';

on('onResourceStart', async (resourceName: string) => {
  if (resourceName === GetCurrentResourceName()) {
    if (!validateConfig()) return;

    const config = getConfig();

    if (config.compareVersionOnStart) {
      await compareResourceVersion();
    }

    const pathArr: Array<() => void> = [];

    if (config.defaultPaths['ensure-resource']) {
      pathArr.push(createEnsureResourcePath);
    }

    startServer(config.server, pathArr);
  }
});
