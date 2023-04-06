import { getConfig, validateConfig } from '~/config';
import { startServer } from '~/startServer';
import { createEnsureResourcePath } from '~/ensureResource';
import { compareResourceVersion } from '~/versionChecker';
import { logger, setLoggerMinLevel } from './logger';

on('onResourceStart', async (resourceName: string) => {
  if (resourceName === GetCurrentResourceName()) {
    const validationResult = validateConfig();

    if (validationResult.status !== 'success') {
      logger.fatal(
        `Invalid config.json detected. Errors: [${validationResult.errors.join(
          ', ',
        )}]`,
      );

      return;
    }

    const config = getConfig();

    if (config.compareVersionOnStart) {
      await compareResourceVersion();
    }

    setLoggerMinLevel(config.logger.level);

    const pathArr: Array<() => void> = [];

    if (config.defaultPaths['ensure-resource']) {
      pathArr.push(createEnsureResourcePath);
    }

    startServer(config.server, pathArr);
  }
});
