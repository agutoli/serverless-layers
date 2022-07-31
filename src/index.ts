import type Serverless from 'serverless';

import type Plugin from 'serverless/classes/Plugin';

import {State} from './core/State';
import {RuntimeResolver} from './core/Runtime';

import {LayerConfig} from './core/LayerConfig';
import {ServerlessFacade} from './core/Facade';

import {RubyRuntimeAdapter} from './runtimes/RubyAdapter';
import {NodeJsRuntimeAdapter} from './runtimes/NodeJsAdapter';
import {PythonRuntimeAdapter} from './runtimes/PythonAdapter';


// custom commands
import * as LayersListCommand from './usecases/LayersCommands/LayersList';
import * as LayersPackageCommand from './usecases/LayersCommands/LayersPackage';

// UseCases
import * as PackOrDeployLayer from './usecases/PackOrDeployLayer';

export class ServerlessLayers implements Plugin {
  customProp = {};

  commands: Plugin.Commands;
  hooks: Plugin.Hooks;
  logging: Plugin.Logging;
  facade: IServerlessFacade;
  runtime: IRuntimeAdapter;

  /**
   * @param serverless - The Serverless initial object
   * @param options - The cli options
   */
  constructor(
    serverless: Serverless,
    options: Serverless.Options,
    logging: Plugin.Logging
  ) {
    // CLI output in plugins
    // @see https://www.serverless.com/framework/docs/guides/plugins/cli-output
    this.logging = logging;

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

    this.commands = {
      'layers:list': {
        usage: 'List all layers related with this stack. E.g. sls layers:list',
        lifecycleEvents: ['list'],
        options: {
          'max-items': {
            usage: 'The maximum number of layers to return.'
          },
          'compatible-runtime': {
            usage: 'A runtime identifier. For example, "nodejs", "nodejs16.x" or "all"'
          },
          'compatible-architecture': {
            usage: 'The compatible instruction set architecture. Possible values include: x86_64 or arm64'
          },
        }
      },
      'layers:package': {
        usage: 'Package layers given a name. E.g. "sls layers:package --layer-name myLayerKey"',
        lifecycleEvents: ['package'],
        options: {
          'layer-name': {
            required: true,
            usage: 'The layer name specified on "custom.serverless-layers.<layer-name>" in serverless.yaml.'
          },
        }
      }
    };

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
      'layers:list:list': this.binder(this.layerListCommandHook),
      'layers:package:package': this.binder(this.layerPackageCommandHook),
      'package:compileLayers': this.binder(this.compileLayersHook),
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

  async compileLayersHook(layerConfig: LayerConfig): Promise<void> {
    console.log('compileLayersHook:', { layerConfig });
  }

  /**
   * This hooks is triggered when using command
   * "sls layers:list"
   * @eventProperty
   */
   async layerListCommandHook(layerConfig: LayerConfig): Promise<void> {
    await LayersListCommand.UseCase({
      layerConfig,
      runtime: this.runtime,
      facade: this.facade,
      logging: this.logging
    });
   }

  /**
   * This hooks is triggered when using command
   * "sls layers:package"
   * @eventProperty
   */
   async layerPackageCommandHook(layerConfig: LayerConfig): Promise<void> {
    await LayersPackageCommand.UseCase({
      layerConfig,
      facade: this.facade,
      runtime: this.runtime,
      logging: this.logging
    });
   }

  /**
   * This hook is triggered when packing or
   * deploying serverless.
   * @eventProperty
   */
  async packageHook(layerConfig: LayerConfig): Promise<void> {
    const state = new State(this.facade, layerConfig);

    await PackOrDeployLayer.UseCase({
      state,
      layerConfig,
      facade: this.facade,
      runtime: this.runtime,
      logging: this.logging
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
