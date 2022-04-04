export const environment = {
  production: false,
  logLevel: 'debug',
  port: process.env.LP_GRAPHQL_GATEWAY_PORT || 3000,
  appName: process.env.APP_NAME || 'ms-graphql-gateway',
  debug: process.env.NODE_ENV === 'development',
  collectorURI: process.env.OTEL_EXPORTER_OTLP_ENDPOINT as string,
};
