import { IncomingHttpHeaders } from 'http';

import { Tracer } from '@opentelemetry/api';
import { ApolloServer } from 'apollo-server';
import { ExpressContext } from 'apollo-server-express';

import { createGateway } from './gateway';

export interface Context {
  headers: IncomingHttpHeaders;
  url: string;
  globalTracer?: Tracer;
}

// This function distinguishes between per-request context & application context
// Anything that has to be initialized once & reused repeatedly (Like a DB connection, OTel tracer) is passed to the arch function
function archContext(tracer?: Tracer): ({ req }: ExpressContext) => Context {
  return ({ req }) => ({
    headers: req.headers,
    url: req.url,
    globalTracer: tracer,
  });
}

export function createServer(tracer?: Tracer) {
  return new ApolloServer({
    gateway: createGateway(),
    debug: false,
    context: archContext(tracer),
  });
}
