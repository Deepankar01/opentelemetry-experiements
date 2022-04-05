import path from 'path';

import { buildSubgraphSchema } from '@apollo/federation';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { ApolloServer } from 'apollo-server';
import depthLimit from 'graphql-depth-limit';
import { Books } from './datasources';
import { BookModel } from './models';
import resolvers from './resolvers';
import { Tracer } from '@opentelemetry/api';

const typeDefs = loadFilesSync(path.join(__dirname, 'schema/**/*.gql'));

console.log(path.join(__dirname, 'schema/**/*.gql'));

export type Context = {
  dataSources: {
    books: Books
  } 
}

export function createServer(tracer: Tracer) {
  return new ApolloServer({
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
  })
}
