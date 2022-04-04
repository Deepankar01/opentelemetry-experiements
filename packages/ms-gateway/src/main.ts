import { OTelEvents, PossibleInstruments, PossibleTraceExporters, initializeTelemetry } from '@opentelemetry-experiments/libs/telemetry';

import { environment } from './environments/environment';

(async () => {
  const globalTracer = await initializeTelemetry(
    environment.appName,
    environment.debug ? [] : [PossibleInstruments.HTTP, PossibleInstruments.Express],
    environment.debug ? PossibleTraceExporters.Console : PossibleTraceExporters.OLTP,
    environment.collectorURI
  );
  await globalTracer.startActiveSpan(OTelEvents.ApolloGraphQLEvents.gatewayInitializing, async span => {
    const createServer = (await import('./server')).createServer;
    await createServer(globalTracer).listen({ port: environment.port });
    span.addEvent(OTelEvents.ApolloGraphQLEvents.gatewayReady, { port: environment.port });
    span.end();
  });
})();
