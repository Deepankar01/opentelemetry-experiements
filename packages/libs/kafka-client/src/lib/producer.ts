import { Kafka, KafkaConfig, Message, Producer } from 'kafkajs';
import { addExitHandler } from 'shutdown-async';

import { createKafkaConfig } from './config';

interface ProducerTopic {
  producer: Producer;
  topic: string;
}

export const makeProducer = async (kafkaConfig: KafkaConfig = createKafkaConfig()): Promise<Producer> => {
  const kafka = new Kafka(kafkaConfig);
  const producer = kafka.producer();
  await producer.connect();
  addExitHandler(async () => {
    await producer.disconnect();
  });
  return producer;
};

export const sendSingle =
  ({ producer, topic }: ProducerTopic) =>
  async (messages: Message[]): Promise<void> => {
    await producer.send({
      topic,
      messages,
    });
  };
