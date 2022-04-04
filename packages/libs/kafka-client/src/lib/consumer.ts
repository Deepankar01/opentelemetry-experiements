import {  RestartOnFailureAction } from '@opentelemetry-experiments/events/generic';
import { JsonEventService } from '@opentelemetry-experiments/events/json';
import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopic,
  EachMessagePayload,
  Kafka,
  KafkaConfig,
  KafkaMessage,
} from 'kafkajs';
import { addExitHandler } from 'shutdown-async';

import { createConsumerConfig, createKafkaConfig } from './config';
import { logger } from './logger';

export type EventHandlerAvro<T> = (
  value: T,
  header: Record<string, unknown>,
  message: KafkaMessage,
  partition: number
) => Promise<void>;

export type EventHandler<TKey, T> = (
  value: T,
  header: Record<string, unknown>,
  key: TKey,
  message: KafkaMessage,
  partition: number
) => Promise<void>;

export type RestartOnFailureHandler = (
  err: Error,
  data: Pick<KafkaMessage, 'offset'> &
    Pick<EachMessagePayload, 'partition' | 'topic'> & { key: string; value: string | null }
) => RestartOnFailureAction | Promise<RestartOnFailureAction>;

const makeConsumer = async (
  kafkaConfig: KafkaConfig,
  consumerConfig: ConsumerConfig,
  topic: ConsumerSubscribeTopic
): Promise<Consumer> => {
  const kafka = new Kafka(kafkaConfig);
  const consumer = kafka.consumer(consumerConfig);
  await consumer.connect();
  await consumer.subscribe(topic);
  addExitHandler(async () => {
    await consumer.disconnect();
  });
  return consumer;
};

export const receiveEvent = async <TKey, T>(
  eventService: JsonEventService<TKey, T>,
  eventHandler: EventHandler<TKey, T>,
  valueBufferFixer: (value: Buffer | null) => Buffer | null = value => value, // this is there coz OMS json has random thing in front of JSON
  isInterestedEvent: (header: Record<string, unknown>) => boolean = () => true,
  restartOnFailureHandler: RestartOnFailureHandler = (err, data) => {
    logger.error({ err, data }, 'Error in event handler, retrying');
    return 'retry';
  },
  consumerConfig: ConsumerConfig = createConsumerConfig(),
  kafkaConfig: KafkaConfig = createKafkaConfig()
): Promise<void> => {
  logger.info(`Starting kafka consumer for topic '${eventService.topic}'`);
  const consumer = await makeConsumer(kafkaConfig, consumerConfig, { topic: eventService.topic });
  await consumer.run({
    eachMessage: async ({ partition, message, topic }) => {
      try {
        const header = eventService.deserializeHeader(message?.headers);
        isInterestedEvent(header);
        const deserialized_message = eventService.deserialize(valueBufferFixer(message.value));
        const key = eventService.deserializeKey(message.key);
        await eventHandler(deserialized_message, header, key, message, partition);
      } catch (err) {
        // this is added because ECOM is sending the null so there is a possibility in GV that we can receive null
        if (message.key == null || message.value == null) {
          logger.warn(
            `Skipping consuming the event either message.key is null or message.value is null ${eventService.topic}:${message.offset}:${partition}`
          );
          return;
        }
        const rawKey = message.key.toString('utf8');
        const rawMessage = message.value && message.value?.toString('utf8');
        switch (
          await restartOnFailureHandler(err, {
            offset: message.offset,
            partition,
            topic,
            key: rawKey,
            value: rawMessage,
          })
        ) {
          case 'retry':
            throw new Error('Signalling retry to kafka.js consumer');
          case 'skip':
            return;
          case 'stop':
            logger.warn(`Stopped consuming ${eventService.topic}:${partition} due to error handler result 'stop'`);
            consumer.pause([{ topic: eventService.topic, partitions: [partition] }]);
        }
      }
    },
  });
};

