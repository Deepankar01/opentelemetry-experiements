import mongoose from 'mongoose';

import logger from './logger';
import { DbConfig } from './config';

export const connectDatabase = async (config: DbConfig, debug: boolean): Promise<void> => {
  try {
    await mongoose.connect(config.connectionString, config.options);
    mongoose.set('debug', debug);
    logger.info('Connected to DB.');
  } catch (err) {
    logger.error(err, 'Error connecting to mongoose');
    throw err;
  }
};

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  logger.info('Disconnecting from DB due to application termination.');
});
