import { IHeaders } from 'kafkajs';

import { SerializedMessage } from './message';

/** A serializer that turns a Javascript object into a representation for sending with key, value and headers */
export interface ISerializer<T> {
  serialize(obj: T): SerializedMessage<T>;
}

/** A deserializer: turns a serialized message into a Javascript object */
export interface IDeserializer<T> {
  /**
   * Deserialize a buffer into a javascript value
   * @throws DeserializationError if message cannot be deserialized
   */
  deserialize(buffer: Buffer | null): T;
}

/**
 * Deserialize a buffer key and value into a javascript value.
 * Value is allowed to be null/undefined to signify a deleted key
 * @note if null is a valid for this message then TValue should also include null,
 *       otherwise a DeserializationError should be thrown if null is not allowed
 * */
export interface IDeserializerWithKey<TKey, TValue> extends IDeserializer<TValue> {
  deserialize(buffer: Buffer | null): TValue;
  deserializeKey: IDeserializer<TKey>['deserialize'];
  deserializeHeader(headers: IHeaders | undefined): Record<string, unknown>;
}

/** A SerDe: SERializer + DEserializer */
export interface ISerde<TInterface> extends ISerializer<TInterface>, IDeserializer<TInterface> {}
export interface ISerdeWithKey<TKey, TValue> extends ISerializer<TValue>, IDeserializerWithKey<TKey, TValue> {}
