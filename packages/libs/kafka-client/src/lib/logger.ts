import { logCreator, logLevel } from 'kafkajs';
import pino from 'pino';

import { env } from './env-vars';

export const logger = pino({
  level: env.logLevel,
  serializers: {
    ...pino.stdSerializers,
    body(value) {
      if (value instanceof Buffer) {
        return `buffer(base64):${value.toString('base64')}`;
      }
      return value;
    },
  },
});

const toPinoLogLevel: Record<logLevel, pino.Level | pino.LevelWithSilent> = {
  [logLevel.ERROR]: 'error',
  [logLevel.WARN]: 'warn',
  [logLevel.INFO]: 'info',
  [logLevel.DEBUG]: 'debug',
  [logLevel.NOTHING]: 'silent',
};

export const fromPinoLogLevel: Record<pino.Level | pino.LevelWithSilent, logLevel> = {
  fatal: logLevel.ERROR,
  error: logLevel.ERROR,
  warn: logLevel.WARN,
  info: logLevel.INFO,
  debug: logLevel.DEBUG,
  trace: logLevel.DEBUG,
  silent: logLevel.NOTHING,
};

export const pinoLogger =
  (logger_name?: string): logCreator =>
  level => {
    const child = logger.child({
      level: toPinoLogLevel[level],
      logger: logger_name,
    });

    return ({ level, log }) => {
      // remove some fields out of the log data
      const { message, error, stack, logger, ...rest } = log;
      child[toPinoLogLevel[level]]({ ...rest, err: error }, message);
    };
  };
