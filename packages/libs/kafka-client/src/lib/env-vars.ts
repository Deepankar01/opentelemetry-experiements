import pino from 'pino';

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable "${name}" is required. Received value: "${value}"`);
  }
  return value;
}

const getEnv = (env: string): string => {
  const result = process.env[env];
  if (!result) {
    throw new Error(`Env var ${env} not set`);
  }
  return result;
};

const logLevel = (level: string): pino.LevelWithSilent => {
  if (level in pino.levels.labels) {
    return level as pino.LevelWithSilent;
  } else {
    // don't have logger set up here yet, use console
    console.warn(`Invalid log level ${level}`);
    return 'info';
  }
};

export const env = {
  appName: getEnv('APP_NAME'),
  logLevel: logLevel(process.env.LOG_LEVEL || 'info'),
  tenant_env: getRequiredEnvVar('TENANT_ENV'),
  kafka_username: getRequiredEnvVar('KAFKA_USERNAME'),
  kafka_cluster: getRequiredEnvVar('KAFKA_CLUSTER'),
  kafka_password: getRequiredEnvVar('KAFKA_PASSWORD'),
};
