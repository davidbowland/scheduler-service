export const logError = (...args: any[]): Promise<unknown> => Promise.resolve(console.error(...args))

export const logErrorWithDefault =
  <Type>(value: Type) =>
    (...args: any[]): Promise<Type> =>
      logError(...args).then(() => value)

export const log = (...args: any[]): Promise<unknown> => Promise.resolve(console.log(...args))
