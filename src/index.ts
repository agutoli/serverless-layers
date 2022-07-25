import Serverless from 'serverless';
import Plugin from 'serverless/classes/Plugin';

import {State} from './core/State';
import {RuntimeResolver} from './core/Runtime';
import {NSLayerConfig, LayerConfig} from './core/LayerConfig';
import {IServerlessFacade, ServerlessFacade} from './core/Facade';


// runtime adapters
import {IRuntimeAdapter, RuntimeAdapter} from './runtimes/Adapter';

import {RubyRuntimeAdapter} from './runtimes/RubyAdapter';
import {NodeJsRuntimeAdapter} from './runtimes/NodeJsAdapter';
import {PythonRuntimeAdapter} from './runtimes/PythonAdapter';

// UseCases
import * as PackOrDeployLayer from './usecases/PackOrDeployLayer';

type CallableHook = (n: LayerConfig) => Promise<void>;

export class ServerlessLayers implements Plugin {
  customProp = {};

  hooks: Plugin.Hooks;
  facade: IServerlessFacade;
  runtime: IRuntimeAdapter;

  /**
   * @param {Serverless} serverless - The first input number
   * @param {Serverless.Options} options - The second input number
   */
  constructor(serverless: Serverless, options: Serverless.Options) {
    // This class is responsible to handle access to
    // serverless framework methods, objects, etc.
    this.facade = new ServerlessFacade(serverless, options);

    // this classes is responsible to detect what
    // runtime adapter should be loaded.
    const resolver = new RuntimeResolver(this.facade);

    // register runtime adapters
    resolver.registerAdapter(new RubyRuntimeAdapter);
    resolver.registerAdapter(new NodeJsRuntimeAdapter);
    resolver.registerAdapter(new PythonRuntimeAdapter);

    // returns the current adapter that
    // is compatible with current runtime.
    this.runtime = resolver.resolve();

    this.hooks = {
      // 'package:compileFunctions': async () => {
      //   console.log('package:compileFunctions');
      // },
      // 'package:createDeploymentArtifacts': async () => {
      //   console.log('package:createDeploymentArtifacts');
      // },
      // 'aws:common:cleanupTempDir:cleanup': async () => {
      //   console.log('aws:common:cleanupTempDir:cleanup');
      // },
      'before:package:initialize': this.binder(this.packageHook),
      'before:package:function:package': this.binder(this.packageHook),
      'aws:info:displayLayers': this.binder(this.finalizeHook),
      'after:deploy:function:deploy': this.binder(this.finalizeHook),
      // 'before:package:function:package': async () => {
      //   console.log('before:package:function:package');
      //   await this.package();
      // },

      // 'after:deploy:function:deploy': async () => {
      //   await this.finalize();
      // },
      // 'plugin:uninstall:uninstall': async () => {
      //   await this.cleanup();
      // },
      // 'remove:remove': async () => {
      //   await this.cleanup();
      // }
    };
  }

  binder(callback: CallableHook) {
    const layersConfig = this.runtime.getLayersConfig();
    return async () => {
      for (const layerConfig in layersConfig) {
        await callback.apply(this, [layersConfig[layerConfig]]);
      }
    }
  }

  /**
   * @Event
   */
  async packageHook(layerConfig: LayerConfig): Promise<void> {
    const state = new State(this.facade, layerConfig);

    await PackOrDeployLayer.UseCase({
      state,
      layerConfig,
      facade: this.facade,
      runtime: this.runtime
    });
  }

  async cleanup(): Promise<void> {
    console.log('cleanup hook');
  }

  async finalizeHook(): Promise<void> {
    console.log('finalize hook');
  }
  // async deploy(): Promise<void> {
  //   const layersConfig = this.config.layersConfig();

  //   console.log(JSON.stringify(layersConfig, null, 2));
  //   // process.exit(0);
  //   // for (const layerConfig of layersConfig) {
  //   // 	console.log({ layerConfig });
  //   // }
  //   // // await layersDeployUseCase(
  //   // // 	this.facade,
  //   // // 	this.config
  //   // // );
  // }
}
