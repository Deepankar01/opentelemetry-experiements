import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { GraphQLRequest, GraphQLService } from 'apollo-server-core';

const bookServiceUrl = process.env.MS_BOOK_URL ?? 'http://book-svc';
const authorServiceUrl = process.env.MS_AUTHOR_URL ?? 'http://author-svc';
const publisherServiceUrl = process.env.MS_PUBLISHER_URL ?? 'http://publisher-svc';

const pollInterval: number = parseInt(process.env.GATEWAY_POLL_INTERVAL as string, 10) ?? 30000;

// Regex for header names that should be forwarded to the underlying servers
export const FORWARD_HEADER_REGEX = /^(X-Leanpos-.*)|(Authorization)$/i;


/***
 * Forwards the incoming request headers coming from the Apollo Federation level
 */
class RequestHeaderForwarder extends RemoteGraphQLDataSource {
  willSendRequest({ request: { http } }: { request: GraphQLRequest }) {
    if (http === undefined) {
      throw Error('Request.http cannot be undefined');
    }

    Object.entries(http.headers ?? [])
      .filter(([header]) => FORWARD_HEADER_REGEX.test(header))
      .forEach(([header, value]) => http.headers.set(header, value));
  }
}

export function createGateway(): GraphQLService {
  return new ApolloGateway({
    serviceList: [
      { name: 'book', url: `${bookServiceUrl}/graphql` },
      { name: 'author', url: `${authorServiceUrl}/graphql` },
      { name: 'publisher', url: `${publisherServiceUrl}/graphql` },
    ],
    buildService({ url }) {
      return new RequestHeaderForwarder({ url });
    },
    debug: false,
    pollIntervalInMs: pollInterval,
    // Don't consider the gateway healthy until it has reached all services
    serviceHealthCheck: true,
  });
}
