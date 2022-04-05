import { connectDatabase } from '@opentelemetry-experiments/db/mongo';
import { environment } from './environments/environment';
import logger from './lib/logger';
import server from './server';

const port: number = parseInt(process.env.MS_BOOK_PORT as string, 10) || 3000;

server.listen({ port }, async () => {
  await connectDatabase({connectionString: environment.db , options: { dbName: 'books'}}, true);
  logger.info(`🚀 Book service ready at ${port}`);
});
