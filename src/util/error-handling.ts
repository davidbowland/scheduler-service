export const handleErrorNoDefault =
  (logFunc = console.error) =>
    (error: Error): unknown =>
      logFunc(error)

export const log =
  (logFunc = console.log) =>
    (...args): unknown =>
      logFunc.call(null, ...args)
