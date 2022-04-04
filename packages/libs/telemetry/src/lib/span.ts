export enum Domains {
  apolloGraphQL = 'Apollo GraphQL',
  cosmosDB = 'Cosmos Database',
  quote = 'Quote',
}

const ApolloGraphQLEvents = {
  gatewayInitializing: `${Domains.apolloGraphQL} Gateway Initializing`,
  gatewayReady: `${Domains.apolloGraphQL} Gateway Ready`,
  subgraphInitializing: `${Domains.apolloGraphQL} Subgraph Initializing`,
  subgraphReady: `${Domains.apolloGraphQL} Subgraph Ready`,
};

const CosmosDBEvents = {
  connecting: `${Domains.cosmosDB} Connecting`,
  connectionReady: `${Domains.cosmosDB} Connection Ready`,
};

const QuoteEvents = {
  order: `${Domains.quote}: order`,
  recalculateOrder: `${Domains.quote}: recalculateOrder`,
};

export const OTelEvents = {
  ApolloGraphQLEvents,
  CosmosDBEvents,
  QuoteEvents,
};
