import path from 'path';

import { buildSubgraphSchema } from '@apollo/federation';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { ApolloServer } from 'apollo-server';
import depthLimit from 'graphql-depth-limit';
import { Books } from './datasources';
import { BookModel } from './models';
import resolvers from './resolvers';

const typeDefs = loadFilesSync(path.join(__dirname, 'schema/**/*.gql'));

console.log(path.join(__dirname, 'schema/**/*.gql'));

export type Context = {
  dataSources: {
    books: Books
  } 
}

const server = new ApolloServer({
  schema: buildSubgraphSchema([
    {
      typeDefs: mergeTypeDefs(typeDefs),
      resolvers,
    },
  ]),
  dataSources: () => ({
    books: new Books(BookModel),
  }),
  validationRules: [depthLimit(7)],
  debug: false,
});

export default server;
