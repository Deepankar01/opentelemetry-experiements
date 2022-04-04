import { DeserializationError } from './error';
import {
  fromJsonBuffer,
  numberFromJsonBuffer,
  stringFromJsonBuffer,
  stringFromUtf8Buffer,
  toJsonBuffer,
} from './serde-default';

describe('The default serializers and deserializer {}', () => {
  describe('stringFromUtf8Buffer', () => {
    test('should read "123" as "123" ', () => {
      expect(stringFromUtf8Buffer(Buffer.from('123', 'utf8'))).toEqual('123');
    });

    test('should read multi-byte characters ', () => {
      expect(stringFromUtf8Buffer(Buffer.from('🌈🦄', 'utf8'))).toEqual('🌈🦄');
    });
  });

  describe('toJsonBuffer', () => {
    test('should add quotes to a string', () => {
      expect(toJsonBuffer('123')).toEqual(Buffer.from('"123"', 'utf8'));
    });

    test('should stringify a number', () => {
      expect(toJsonBuffer(123)).toEqual(Buffer.from('123', 'utf8'));
    });

    test('should JSON-ify an object', () => {
      expect(toJsonBuffer({ Hello: 'World' })).toEqual(Buffer.from('{"Hello":"World"}', 'utf8'));
    });
  });

  describe('fromJsonBuffer', () => {
    test('should read a string with quotes', () => {
      expect(fromJsonBuffer(Buffer.from('"123"', 'utf8'))).toEqual('123');
    });

    test('should reject a string without quotes', () => {
      expect(() => fromJsonBuffer(Buffer.from('abcdef', 'utf8'))).toThrowError(DeserializationError);
    });

    test('should read a stringified number', () => {
      expect(fromJsonBuffer(Buffer.from('123', 'utf8'))).toEqual(123);
    });

    test('should read a JSON object', () => {
      expect(fromJsonBuffer(Buffer.from('{"Hello":"World"}', 'utf8'))).toEqual({ Hello: 'World' });
    });
  });

  describe('stringFromJsonBuffer', () => {
    test('should read a string with quotes', () => {
      expect(stringFromJsonBuffer(Buffer.from('"123"', 'utf8'))).toEqual('123');
    });

    test('should reject a string without quotes', () => {
      expect(() => stringFromJsonBuffer(Buffer.from('abcdef', 'utf8'))).toThrowError(DeserializationError);
    });

    test('should reject a number', () => {
      expect(() => stringFromJsonBuffer(Buffer.from('123', 'utf8'))).toThrowError(DeserializationError);
    });
  });

  describe('numberFromJsonBuffer', () => {
    test('should read a stringified number', () => {
      expect(numberFromJsonBuffer(Buffer.from('123', 'utf8'))).toEqual(123);
    });

    test('should reject a string', () => {
      expect(() => numberFromJsonBuffer(Buffer.from('"123"', 'utf8'))).toThrowError(DeserializationError);
    });
  });
});
