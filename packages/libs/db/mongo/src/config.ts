import { ConnectOptions } from 'mongoose';

export interface DbConfig {
  connectionString: string;
  options: ConnectOptions;
}

export const dbConfig = (config: Partial<DbConfig>): DbConfig => ({
  ...config,
  connectionString: '',
  options: { ...config.options },
});
