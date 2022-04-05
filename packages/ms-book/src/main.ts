import logger from './lib/logger';
import server from './server';

const port: number = parseInt(process.env.MS_BOOK_PORT as string, 10) || 3000;

server.listen({ port }, () => {
  logger.info(`🚀 Book service ready at ${port}`);
});
