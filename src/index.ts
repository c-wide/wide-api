import jsonschema from 'jsonschema';
import { logger } from '~/logger';
import { getConfig } from '~/getConfig';
import { startServer } from '~/startServer';
import { createEnsureResourcePath } from '~/ensureResource';
import configSchema from '../config.schema.json';

on('onResourceStart', (resourceName: string) => {
  if (resourceName === GetCurrentResourceName()) {
    const validatorResponse = new jsonschema.Validator().validate(
      getConfig(),
      configSchema,
    );

    if (!validatorResponse.valid) {
      logger.fatal(
        `Invalid config.json detected. Errors: [${validatorResponse.errors.join(
          ', ',
        )}]`,
      );

      return;
    }

    const { server, defaultPaths } = getConfig();

    const pathArr: Array<() => void> = [];

    if (defaultPaths['ensure-resource']) {
      pathArr.push(createEnsureResourcePath);
    }

    startServer(server, pathArr);
  }
});
