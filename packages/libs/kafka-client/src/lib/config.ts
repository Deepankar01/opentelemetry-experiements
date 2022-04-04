import { ConsumerConfig, KafkaConfig } from 'kafkajs';

import { env } from './env-vars';
import { fromPinoLogLevel, pinoLogger } from './logger';

export const createKafkaConfig = (config?: Partial<KafkaConfig>): KafkaConfig => ({
  brokers: [env.kafka_cluster],
  logLevel: fromPinoLogLevel[env.logLevel],
  logCreator: pinoLogger('oms_billing_events'),
  clientId: `leanpos-${env.tenant_env}-${env.appName}`,
  ssl: {
    /**
     * the kafka_cluster is usually derived from eventhub-gvid-nonprod-01.servicebus.windows.net:9003
     * the servername is usually eventhub-gvid-nonprod-01.servicebus.windows.net the first part of the url
     */
    servername: env.kafka_cluster.split(':')[0],
  },
  sasl: {
    username: env.kafka_username,
    password: env.kafka_password,
    mechanism: 'plain',
  },
  ...config,
});

export const createConsumerConfig = (config?: Partial<ConsumerConfig>): ConsumerConfig => ({
  groupId: `leanpos-${env.tenant_env}-${env.appName}`,
  ...config,
});
