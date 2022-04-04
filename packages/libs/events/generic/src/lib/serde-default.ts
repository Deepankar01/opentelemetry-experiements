import { DeserializationError, deserializationError } from './error';
import { DeserializeFn, DeserlizeStringFn, mapDeserializer } from './serde-transformation';

/** Transform any value into a Buffer with its JSON value */
export const toJsonBuffer = <T>(value: T): Buffer => Buffer.from(JSON.stringify(value));

/** Read a Buffer with a JSON string */
export const fromJsonBuffer: DeserializeFn<unknown> = (buffer: Buffer): unknown => {
  try {
    const utf8 = stringFromUtf8Buffer(buffer);
    try {
      return JSON.parse(utf8);
    } catch (e) {
      throw new DeserializationError(`Value is not valid JSON: ${e.toString()}`, utf8);
    }
  } catch (e) {
    throw new DeserializationError('Value is not valid utf8 text', buffer);
  }
};

/**
 * Read buffer with UTF-8 data as string
 * @example 0x48 0x69 => 'Hi'
 * */
export const stringFromUtf8Buffer: DeserializeFn<string> = buffer => buffer.toString('utf8');

/**
 * Read buffer with JSON string as a string
 * @example 0x22 0x48 0x69 0x22 => '"Hi"' => 'Hi'
 * */
export const stringFromJsonBuffer: DeserializeFn<string> = mapDeserializer(fromJsonBuffer, value =>
  typeof value === 'string' ? value : deserializationError('Not a string', value)
);

/**
 * Read buffer with UTF-8 json number as a number
 * @example 0x31 0x32 0x33 => '123' => 123
 * */
export const numberFromJsonBuffer: DeserializeFn<number> = mapDeserializer(fromJsonBuffer, value =>
  typeof value === 'number' ? value : deserializationError('Not a number', value)
);

export const fromJsonString: DeserlizeStringFn<unknown> = (stringValue: string): unknown => {
  try {
    return JSON.parse(stringValue);
  } catch (e) {
    throw new DeserializationError(`Value is not valid JSON: ${e.toString()}`, stringValue);
  }
};

export const toJsonString = <T>(value: T): string => JSON.stringify(value);
