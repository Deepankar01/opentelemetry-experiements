import { SerializedMessageString } from './message';

/** A serializer that turns a Javascript object into a representation for sending with key, value and headers */
export interface ISerializerLedger<T> {
  serialize(obj: T): SerializedMessageString<T>;
}

/** A deserializer: turns a serialized message into a Javascript object */
export interface IDeserializerLedger<T> {
  /**
   * Deserialize a strigified JSON into a javascript value
   * @throws DeserializationError if message cannot be deserialized
   */
  deserialize(buffer: string): T;
}

/** A SerDe: SERializer + DEserializer */
export interface ISerdeLedger<TInterface> extends ISerializerLedger<TInterface>, IDeserializerLedger<TInterface> {}
