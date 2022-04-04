import Ajv, { Options } from 'ajv';
import addFormats from 'ajv-formats';
import Ajv2019 from 'ajv/dist/2019';

export const createAjv = (opts: Options = {}): Ajv => {
  const ajv = new Ajv({
    // when validating data against a schema, fill in missing fields on the validating object with defaults if available
    useDefaults: true,

    // Collect all errors at once instead of only the first
    allErrors: true,
    // Add the schema and invalid data in the error, this eases debugging
    verbose: true,

    // Throw exceptions on some JSON schema errors instead of only logging to prevent mistakes
    strict: true,
    // Support the "discriminator" keyword for the OpenAPI spec to improve efficiency and error reporting if it is there
    discriminator: true,
    ...opts,
  });
  addFormats(ajv);
  return ajv;
};

export const createAjv2019 = (opts: Options = {}): Ajv => {
  const ajv = new Ajv2019({
    useDefaults: true,
    allErrors: true,
    verbose: true,
    strict: true,
    discriminator: true,
    ...opts,
  });
  addFormats(ajv);
  return ajv;
};
