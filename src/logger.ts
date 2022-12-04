import { Logger } from 'tslog';
import { getConfig, LoggerLevel } from '~/getConfig';

const level = getConfig().logger.level;

export const logger = new Logger({
  prettyLogTemplate: '[{{dateIsoStr}}] [{{logLevelName}}] - ',
  minLevel:
    level === LoggerLevel.Debug
      ? 2
      : level === LoggerLevel.Info
      ? 3
      : level === LoggerLevel.Warn
      ? 4
      : 5,
});
