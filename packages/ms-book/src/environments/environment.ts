function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable "${name}" is required. Received value: "${value}"`);
  }
  return value;
}

export const environment = {
  production: false,
  db: getRequiredEnvVar('BOOKS_DATABASE_CONNECTION_STRING')
};
