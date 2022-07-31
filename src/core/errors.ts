export = {
  NotImplemented: CustomError(
    "NotImplemented",
    "Method not implemented."
  ),
  MissingRuntime: CustomError(
    "MissingRuntime",
    "The \"provider.runtime\" option is required!"
  ),
  RuntimeAdapterConflict: CustomError(
    "RuntimeAdapterConflict",
  ),
  InvalidRuntime: CustomError(
    "InvalidRuntime"
  ),
  UnzippedLayerSize: CustomError(
    "UnzippedLayerSize"
  ),
  InvalidLayerPackage: CustomError(
    "InvalidLayerPackage"
  ),
  CommandError: CustomError(
    "CommandError"
  ),
  NotSupported: CustomError(
    "NotSupported"
  )
}

function CustomError(name: string, defaultMessage?: string) {
  return class extends Error {
    constructor(message?: string) {
      super(message || defaultMessage);
      this.name = `ServerlessLayers:${name}`;
    }
  };
}
