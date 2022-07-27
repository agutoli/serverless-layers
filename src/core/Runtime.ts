import Err from './errors';

import {LayerConfig} from './LayerConfig';


export class RuntimeResolver {
  // Runtime string defined at
  // serverless.yaml file.
  // E.g. provider.runtime: "nodejs14.x"
  private _facade: IServerlessFacade;

  private _adapter: IRuntimeAdapter | undefined;

  // stores registered adapters ids
  private _registeredAdapters:  Array<Config.RuntimeIds> = [];

  /**
   * Final class (not able to extends)
   */
  constructor(facade: IServerlessFacade) {
    this._facade = facade;
  }

  /**
   * This method validates, and register
   * adapter that maches with current runtime.
   *
   * @param adapter - Runtime adapter instance.
   */
  registerAdapter(adapter: IRuntimeAdapter): void | Error {
    const runtimeOption = this._facade.getRuntime();

    // check if runtime not defined
    if (!runtimeOption) {
      throw new Err.MissingRuntime();
    }

    const runtimeId = adapter.runtimeId;

    // check if adapters already registered
    if (this._registeredAdapters.includes(runtimeId)) {
      const errMessage = `The runtime ID "${runtimeId}" is duplicated. It must be unique!`;
      throw new Err.RuntimeAdapterConflict(errMessage);
    }

    // check if current configured runtimes
    // matches with any of registered adapter.
    if (runtimeOption.startsWith(runtimeId)) {
      const layersConfig = this.parseLayersConfig(adapter);

      // loads layers configurations
      adapter.loadLayersConfig(layersConfig);

      this._adapter = adapter;
    }

    // stores registred adapters
    this._registeredAdapters.push(runtimeId);
  }

  /**
   * Returns the runtime adapter
   * compatible with current runtime.
   */
  resolve(): IRuntimeAdapter {
    const runtimeOption = this._facade.getRuntime();
    // Invalid/or not supported runtime
    if(!this._adapter) {
      throw new Err.InvalidRuntime(`Unknown provider.runtime \"${runtimeOption}\".`);
    }
    return this._adapter;
  }

  parseLayersConfig(adapter: IRuntimeAdapter): LayerConfig[] {
    // retrieves yaml custom configs
    const customConfigs = this._facade.getCustomConfigs();

    // retrieves runtime default configs
    const runtimeConfigs = {
      runtime: this._facade.getRuntime(),
      runtimeDir: adapter?.runtimeId,
      deploymentBucket: this._facade.getDeploymentBucketName(),
      compatibleRuntimes: [adapter?.runtimeId],
      ...adapter?.defaultConfig
    };

    const createLayerConfigInstances = (
      previous: LayerConfig[],
      current: KeyValue<Config.CustomConfigs>
    ): LayerConfig[] => {
      /**
       * @example
       * ```
       * [
       *   'myGivenLayerName',
       *   {
       *      ...
       *      packageManager: 'npm',
       *      arn: '...'
       *      ...
       *   }
       * ]
       * ```
       */
      const customConfigEntries = Object.entries<Config.CustomConfigs>(current);

      for (const [layerName, customConfig] of customConfigEntries) {
        // merges default runtime configs with custom configs entries
        const v = new LayerConfig(layerName, {
          ...runtimeConfigs,
          ...customConfig
        });
        previous.push(v);
      }

      return previous;
    }
    return customConfigs.reduce<LayerConfig[]>(createLayerConfigInstances, []);
  }
}
