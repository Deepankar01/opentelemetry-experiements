import * as OTel from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { InstrumentationOption } from '@opentelemetry/instrumentation/build/src/types_internal';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { ConsoleStringExporter } from './console-exporter';

enum InstrumentList {
  HTTP = 'HTTP',
  Express = 'Express',
  Pino = 'Pino',
  GraphQL = 'GraphQL',
}

export const PossibleInstruments: Record<InstrumentList, (...args: Array<string>) => InstrumentationOption> = {
  HTTP: () => new HttpInstrumentation(),
  Express: () => new ExpressInstrumentation(),
  Pino: appName =>
    new PinoInstrumentation({
      logHook: (span, record) => {
        record['resource.service.name'] = appName;
      },
    }),
  GraphQL: () => new GraphQLInstrumentation(),
};

enum TraceExportersList {
  Console = 'Console',
  OLTP = 'OLTP',
}

export const PossibleTraceExporters: Record<TraceExportersList, (...args: Array<string>) => SpanExporter> = {
  Console: () => new ConsoleStringExporter(),
  OLTP: collectorURI =>
    new OTLPTraceExporter({
      url: `${collectorURI}v1/traces`,
    }),
};

export async function initializeTelemetry(
  appName: string,
  instrumentationList: Array<typeof PossibleInstruments[InstrumentList]>,
  traceExporter: typeof PossibleTraceExporters[TraceExportersList],
  collectorURI: string
) {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: appName,
    }),
    instrumentations: instrumentationList.map(instrument => instrument(appName)),
    traceExporter: traceExporter(collectorURI),
  });
  await sdk.start();

  // Initialize global tracer
  return OTel.trace.getTracer(appName);
}
