import { getConfig, validateConfig } from '~/config';
import { startServer } from '~/startServer';
import { compareResourceVersion } from '~/versionChecker';
import { logger, setLoggerMinLevel } from '~/logger';

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
    startServer();
  }
});
