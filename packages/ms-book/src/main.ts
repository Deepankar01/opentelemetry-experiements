import { connectDatabase } from '@opentelemetry-experiments/db/mongo';
import { initializeTelemetry, OTelEvents, PossibleInstruments, PossibleTraceExporters } from '@opentelemetry-experiments/libs/telemetry';
import { environment } from './environments/environment';
import logger from './lib/logger';


const port: number = parseInt(process.env.MS_BOOK_PORT as string, 10) || 3000;


(async () => {
  const globalTracer = await initializeTelemetry(
    environment.appName,
    [PossibleInstruments.GraphQL, PossibleInstruments.MongoDB, PossibleInstruments.HTTP],
    PossibleTraceExporters.Zipkin({url: environment.zipkinUrl}),
  );
  await globalTracer.startActiveSpan(OTelEvents.ApolloGraphQLEvents.subgraphInitializing, async span => {
    span.addEvent(OTelEvents.MongoDBEvents.connecting);
    await connectDatabase({connectionString: environment.db , options: { dbName: 'books'}}, true);
    span.addEvent(OTelEvents.MongoDBEvents.connectionReady);

    const createServer = (await import('./server')).createServer;
    await createServer(globalTracer).listen({ port });
    logger.info(`🚀 Book service ready at ${port}`);
    span.addEvent(OTelEvents.ApolloGraphQLEvents.subgraphReady, { port:port });
    span.end();
  });
})();