export const LoggerLevel = {
  Debug: 'debug',
  Info: 'info',
  Warn: 'warn',
  Error: 'error',
} as const;

export type ServerConfig = {
  port: number;
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
};

const resourceConfig: ResourceConfig = JSON.parse(
  LoadResourceFile(GetCurrentResourceName(), 'config.json'),
);

export const getConfig = (): ResourceConfig => {
  return resourceConfig;
};
