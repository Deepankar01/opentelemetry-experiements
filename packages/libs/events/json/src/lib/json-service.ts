import Ajv from 'ajv';

import { IJSONSerdeLedger, JSONSerdeLedger, JsonEventValidator, createAjv, createEventValidator } from './index';

export interface JsonLedger<TValue> extends JsonEventValidator<TValue>, IJSONSerdeLedger<TValue> {
  serde: IJSONSerdeLedger<TValue>;
}
export const createStringService = <TValue>(
  schema: { $schema: string },
  ajv: Ajv = createAjv()
): JsonLedger<TValue> => {
  const { validate, ...validator } = createEventValidator<TValue>(schema);
  const serde = new JSONSerdeLedger<TValue>(validate, ajv);
  return {
    serde,
    schema: validator.schema,
    validate,
    serialize: value => serde.serialize(value),
    deserialize: buffer => serde.deserialize(buffer),
    ajv,
    errors: () => ajv.errors ?? [],
  };
};
