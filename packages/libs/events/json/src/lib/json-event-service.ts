import { DeserializeFn } from '@opentelemetry-experiments/events/generic';
import Ajv, { ErrorObject, JSONSchemaType, ValidateFunction } from 'ajv';

import { createAjv } from './ajv';
import { IJSONSerde, JSONSerde } from './json-serde';

export interface JsonEventValidator<T> {
  schema: JSONSchemaType<T>;
  validate: ValidateFunction<T>;
  ajv: Ajv;
  errors(): ErrorObject[];
}

export interface JsonEventService<TKey, TValue> extends JsonEventValidator<TValue>, IJSONSerde<TKey, TValue> {
  topic: string;
  serde: IJSONSerde<TKey, TValue>;
}

export const createEventValidator = <T>(
  schema: { $schema: string; $id?: string },
  ajv: Ajv = createAjv()
): JsonEventValidator<T> => {
  let validate: ValidateFunction<T>;
  try {
    validate = ajv.compile<T>(schema);
  } catch (err) {
    throw new Error(`Invalid JSON schema ${schema.$id ?? 'without id'}: ${err.message}\n${JSON.stringify(schema)}`);
  }

  return {
    schema: schema as unknown as JSONSchemaType<T>,
    validate,
    ajv,
    errors: () => ajv.errors ?? [],
  };
};

export const createEventService = <TKey, TValue>(
  schema: { $schema: string },
  topic: string,
  keyFunction: (value: TValue) => TKey,
  validateKey: DeserializeFn<TKey>,
  ajv: Ajv = createAjv()
): JsonEventService<TKey, TValue> => {
  const { validate, ...validator } = createEventValidator<TValue>(schema, ajv);
  const serde = new JSONSerde<TKey, TValue>(validate, keyFunction, validateKey, ajv);
  return {
    topic,
    schema: validator.schema,
    validate,
    serde,
    serialize: value => serde.serialize(value),
    deserialize: buffer => serde.deserialize(buffer),
    deserializeKey: buffer => serde.deserializeKey(buffer),
    deserializeHeader: buffer => serde.deserializeHeader(buffer),
    ajv,
    errors: () => ajv.errors ?? [],
  };
};
