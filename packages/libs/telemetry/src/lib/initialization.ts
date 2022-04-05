import * as OTel from '@opentelemetry/api';
import { ExporterConfig, ZipkinExporter } from '@opentelemetry/exporter-zipkin'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { InstrumentationOption } from '@opentelemetry/instrumentation/build/src/types_internal';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { MongooseInstrumentation, SerializerPayload } from 'opentelemetry-instrumentation-mongoose';

import { ConsoleStringExporter } from './console-exporter';

enum InstrumentList {
  MongoDB = 'MongoDB',
  HTTP = 'HTTP',
  Express = 'Express',
  GraphQL = 'GraphQL',
}

export const PossibleInstruments: Record<InstrumentList, (...args: Array<string>) => InstrumentationOption> = {
  MongoDB: () => new MongooseInstrumentation({
    dbStatementSerializer: (operation: string, payload: SerializerPayload):string => {
      console.log(operation);
      return JSON.stringify(payload);
    } 
  }),
  HTTP: () => new HttpInstrumentation(),
  Express: () => new ExpressInstrumentation(),
  GraphQL: () => new GraphQLInstrumentation(),
};

enum TraceExportersList {
  Console = 'Console',
  Zipkin = 'Zipkin',
}

export const PossibleTraceExporters: Record<TraceExportersList, (config: Partial<ExporterConfig> | undefined) => SpanExporter> = {
  Console: () => new ConsoleStringExporter(),
  Zipkin: (config?: Partial<ExporterConfig>) => new ZipkinExporter(config)
};

export async function initializeTelemetry(
  appName: string,
  instrumentationList: Array<typeof PossibleInstruments[InstrumentList]>,
  traceExporter: ReturnType<typeof PossibleTraceExporters[TraceExportersList]>,
) {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: appName,
    }),
    instrumentations: instrumentationList.map(instrument => instrument(appName)),
    traceExporter: traceExporter,
  });
  await sdk.start();

  // Initialize global tracer
  return OTel.trace.getTracer(appName);
}
