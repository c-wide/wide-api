import jsonschema from 'jsonschema';
import configSchema from '../config.schema.json';
import type { LoggerLevels } from '~/logger';

export type ResourceConfig = {
  server: {
    port: number;
    enableCors: boolean;
    accessKeys: Array<{ description: string; key: string }>;
  };
  defaultPaths: {
    'ensure-resource': boolean;
  };
  logger: {
    level: LoggerLevels;
  };
  compareVersionOnStart: boolean;
};

export type ConfigValidationResponse =
  | { status: 'success' }
  | { status: 'error'; errors: Array<string> };

const resourceConfig: ResourceConfig = JSON.parse(
  LoadResourceFile(GetCurrentResourceName(), 'config.json'),
);

export function validateConfig(): ConfigValidationResponse {
  const validatorResponse = new jsonschema.Validator().validate(
    resourceConfig,
    configSchema,
  );

  if (!validatorResponse.valid) {
    return {
      status: 'error',
      errors: validatorResponse.errors.map((error) => error.stack),
    };
  }

  return { status: 'success' };
}

export function getConfig(): ResourceConfig {
  return resourceConfig;
}
