import { ISerdeLedger, SerializedMessageString, fromJsonString, toJsonString } from '@opentelemetry-experiments/events/generic';
import Ajv, { ValidateFunction } from 'ajv';

import { createAjv } from './ajv';
import { validateOrThrow } from './json-serde';

export interface IJSONSerdeLedger<TValue> extends ISerdeLedger<TValue> {
  deserialize(value: string | null): TValue;
  serialize(value: TValue): SerializedMessageString<TValue>;
}

export class JSONSerdeLedger<TValue> implements IJSONSerdeLedger<TValue> {
  constructor(private validate: ValidateFunction<TValue>, private ajv: Ajv = createAjv()) {}
  deserialize(stringifyJSON: string | null): TValue {
    return validateOrThrow(
      this.validate,
      this.ajv,
      typeof stringifyJSON === 'string' ? fromJsonString(stringifyJSON) : stringifyJSON
    );
  }
  serialize(value: TValue): SerializedMessageString<TValue> {
    return {
      value: toJsonString(value),
    };
  }
}
