import jsonschema from 'jsonschema';
import { Logger } from 'tslog';
import configSchema from '../config.schema.json';

export const LoggerLevel = {
  Debug: 'debug',
  Info: 'info',
  Warn: 'warn',
  Error: 'error',
} as const;

export type ServerConfig = {
  port: number;
  enableCors: boolean;
  accessKeys: Array<{ description: string; key: string }>;
};

export type ResourceConfig = {
  server: ServerConfig;
  defaultPaths: {
    'ensure-resource': boolean;
  };
  logger: {
    level: typeof LoggerLevel[keyof typeof LoggerLevel];
  };
  compareVersionOnStart: boolean;
};

const resourceConfig: ResourceConfig = JSON.parse(
  LoadResourceFile(GetCurrentResourceName(), 'config.json'),
);

export function validateConfig(): boolean {
  const validatorResponse = new jsonschema.Validator().validate(
    resourceConfig,
    configSchema,
  );

  if (!validatorResponse.valid) {
    const logger = new Logger({
      prettyLogTemplate: '[{{dateIsoStr}}] [{{logLevelName}}] - ',
    });

    logger.fatal(
      `Invalid config.json detected. Errors: [${validatorResponse.errors.join(
        ', ',
      )}]`,
    );

    return false;
  }

  return true;
}

export function getConfig(): ResourceConfig {
  return resourceConfig;
}
