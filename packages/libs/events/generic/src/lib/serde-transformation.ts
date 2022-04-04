export type SerializeFn<T> = (value: T) => Buffer;
export type DeserializeFn<T> = (value: Buffer | null) => T;
export type DeserlizeStringFn<T> = (value: string) => T;

/** Make a new deserializer by first running another, and then transforming the result with a function*/
export const mapDeserializer =
  <In, Out>(first: DeserializeFn<In>, f: (value: In) => Out): DeserializeFn<Out> =>
  buffer =>
    f(first(buffer));
