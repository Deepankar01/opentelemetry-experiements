import {
  DeserializeFn,
  ISerdeWithKey,
  SerializedMessage,
  fromJsonBuffer,
  stringFromUtf8Buffer,
  toJsonBuffer,
} from '@opentelemetry-experiments/events/generic';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import { IHeaders } from 'kafkajs';

import { createAjv } from './ajv';

export interface IJSONSerde<TKey, TValue> extends ISerdeWithKey<TKey, TValue> {
  deserialize(buffer: Buffer | null | unknown): TValue;
}

export class JSONSerde<TKey, TValue> implements IJSONSerde<TKey, TValue> {
  constructor(
    private validate: ValidateFunction<TValue>,
    private keyFunction: (obj: TValue) => TKey,
    public readonly deserializeKey: DeserializeFn<TKey>,
    private ajv: Ajv = createAjv()
  ) {}

  deserializeHeader(headers: IHeaders | undefined): Record<string, unknown> {
    const deserializedHeaders: Record<string, unknown> = {};
    if (headers) {
      Object.entries(headers).forEach(
        ([key, value]) => (deserializedHeaders[key] = Buffer.isBuffer(value) ? stringFromUtf8Buffer(value) : value)
      );
    }
    return deserializedHeaders;
  }

  deserialize(bufferOrValue: Buffer | null | unknown): TValue {
    return validateOrThrow(
      this.validate,
      this.ajv,
      Buffer.isBuffer(bufferOrValue) ? fromJsonBuffer(bufferOrValue) : bufferOrValue
    );
  }

  serialize(value: TValue): SerializedMessage<TValue> {
    return {
      // validate value first, to ensure that
      value: toJsonBuffer(validateOrThrow(this.validate, this.ajv, value)),
      key: toJsonBuffer(this.keyFunction(value)),
    };
  }
}

export class JSONSchemaValidationError extends Error {
  public readonly name: 'JSONSchemaValidationError';

  public readonly value: unknown;
  public readonly errors?: ErrorObject[];

  constructor(message: string, value: unknown, errors?: ErrorObject[] | null) {
    super(message);
    this.name = 'JSONSchemaValidationError';
    this.value = value;
    this.errors = errors ? errors : undefined;
  }
}

export const validateOrThrow = <T>(validate: ValidateFunction<T>, ajv: Ajv, json: unknown): T => {
  if (validate(json)) {
    return json;
  } else {
    const errors = validate.errors;
    const textError = ajv.errorsText(errors);
    throw new JSONSchemaValidationError(`Value does not validate against JSON schema: ${textError}`, json, errors);
  }
};

export const validatorToDeserializeFn =
  <T>(validate: ValidateFunction<T>, ajv: Ajv): DeserializeFn<T> =>
  buffer =>
    validateOrThrow(validate, ajv, fromJsonBuffer(buffer));
