export enum Domains {
  apolloGraphQL = 'Apollo GraphQL',
  mongoDB = 'Mongo Database',
  quote = 'Quote',
}

const ApolloGraphQLEvents = {
  gatewayInitializing: `${Domains.apolloGraphQL} Gateway Initializing`,
  gatewayReady: `${Domains.apolloGraphQL} Gateway Ready`,
  subgraphInitializing: `${Domains.apolloGraphQL} Subgraph Initializing`,
  subgraphReady: `${Domains.apolloGraphQL} Subgraph Ready`,
};

const MongoDBEvents = {
  connecting: `${Domains.mongoDB} Connecting`,
  connectionReady: `${Domains.mongoDB} Connection Ready`,
};

const QuoteEvents = {
  order: `${Domains.quote}: order`,
  recalculateOrder: `${Domains.quote}: recalculateOrder`,
};

export const OTelEvents = {
  ApolloGraphQLEvents,
  MongoDBEvents,
  QuoteEvents,
};
