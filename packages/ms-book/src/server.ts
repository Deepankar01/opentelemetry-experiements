import path from 'path';

import { buildSubgraphSchema } from '@apollo/federation';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import { Books } from './datasources';
import { BookModel } from './models';
import resolvers from './resolvers';
import { Tracer } from '@opentelemetry/api';
import { PossibleTraceExporters, RequestCountMeter } from '@opentelemetry-experiments/libs/telemetry';
import bodyParser from 'body-parser';
// import { environment } from './environments/environment';

const typeDefs = loadFilesSync(path.join(__dirname, 'schema/**/*.gql'));

console.log(path.join(__dirname, 'schema/**/*.gql'));

export type Context = {
  dataSources: {
    books: Books
  } 
}

export async function createServer(tracer: Tracer) {
  const app = express();
  const requestCounter = new RequestCountMeter('ms-book', PossibleTraceExporters.Console(undefined));
  const server = new ApolloServer({
    schema: buildSubgraphSchema([
      {
        typeDefs: mergeTypeDefs(typeDefs),
        resolvers,
      },
    ]),
    context: ()=> ({
      globalTracer: tracer,
    }),
    dataSources: () => ({
      books: new Books(BookModel),
    }),
    validationRules: [depthLimit(7)],
    debug: false,
  });
  await server.start();
  app.use(bodyParser.json())
  app.use(requestCounter.countAllRequests());
  server.applyMiddleware({ app });

  return {app, server};
}
