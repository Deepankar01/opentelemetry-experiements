import { ISerializer } from './serde';
import { SerializeFn } from './serde-transformation';

/** A serialized message with a partition key */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface SerializedMessage<T> {
  value: Buffer;
  key: Buffer;
  headers?: Record<string, Buffer | string | undefined>;
  timestamp?: string; //TODO: figure out which format kafka.js wants timestamps in
}

/** Turns a full message serializer into a serialization function */
export const functionFromSerializer =
  <T>(serializer: ISerializer<T>): SerializeFn<T> =>
  value =>
    serializer.serialize(value).value;

/** A serialized message with a stringified JSON */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface SerializedMessageString<T> {
  value: string;
}
