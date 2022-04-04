export class DeserializationError extends Error {
  public readonly name: 'DeserializationError';

  public readonly value?: unknown;
  public readonly errors?: Error[];

  constructor(message: string, value?: unknown | null, errors?: Error[] | null) {
    super(message);
    this.name = 'DeserializationError';
    this.value = value !== null ? value : undefined;
    this.errors = errors ?? undefined;
  }
}

export const deserializationError = (message: string, value?: unknown | null, errors?: Error[]): never => {
  throw new DeserializationError(message, value, errors);
};
