import { getConfig, validateConfig } from '~/getConfig';
import { startServer } from '~/startServer';
import { createEnsureResourcePath } from '~/ensureResource';

on('onResourceStart', (resourceName: string) => {
  if (resourceName === GetCurrentResourceName()) {
    if (!validateConfig()) return;

    const { server, defaultPaths } = getConfig();

    const pathArr: Array<() => void> = [];

    if (defaultPaths['ensure-resource']) {
      pathArr.push(createEnsureResourcePath);
    }

    startServer(server, pathArr);
  }
});
