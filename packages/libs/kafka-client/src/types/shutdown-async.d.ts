declare module 'shutdown-async';

export const addExitHandler: (handler: () => T | Promise<T>) => void;
