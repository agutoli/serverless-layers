import Err from './errors';
import path from 'path';
import {IServerlessFacade} from './Facade';
import {IRuntimeAdapter} from '../runtimes/Adapter';

export declare namespace NSLayerConfig {
  /**
   * Supported Runtimes
   */
  type RuntimeIds = 'nodejs' | 'python' | 'ruby';

  /**
   * The common configurations across
   * all supported languages.
   */
  interface ICommon {
    arn?: string;

    compileDir: string;

    layersDeploymentBucket?: string | undefined,

    /**
     * The NodeJs AWS supported runtimes.
     */
    dependenciesPath: string;

    /**
     * The NodeJs AWS supported runtimes.
     */
    compatibleRuntimes: Array<string>;

    /**
     * The instruction set architecture of a Lambda function determines the
     * type of computer processor that Lambda uses to run the function.
     * Lambda provides a choice of instruction set architectures:
     */
    compatibleArchitectures: Array<string>;
  }

  /**
   * Specific configurations for NodeJS
   */
  interface INodeJS extends ICommon {
    libraryFolder: string;
    /**
     * Supported package managers
     */
    packageManager: "yarn" | "npm" | undefined;
  }

  /**
   * Specific configurations for Ruby
   */
   interface IRuby extends ICommon {
    /**
     * Supported package managers
     */
    packageManager: "bundle" | undefined;
  }

  /**
   * Specific configurations for Ruby
   */
  interface IPython extends ICommon {
    /**
     * Supported package managers
     */
    packageManager: "pip" | undefined;
  }

  /**
   * The configurations that can
   * be set on serverless.yaml file
   * by using "custom" property.
   */
  type CustomConfigs = INodeJS | IRuby | IPython;
};

export class LayerConfig {
  arn?: string;

  _config: NSLayerConfig.CustomConfigs;

  constructor(configHey: string, _config: any) {
    this._config = Object.assign({
      path: process.cwd(),
      functions: null,
      configHey: configHey,
      forceInstall: false,
      dependencyInstall: true,
      compileDir: ".serverless",
      customInstallationCommand: null,
      compatibleArchitectures: ["x86_64", "arm64"],
    }, _config);

    // assign values to class
    Object.assign(this, this._config);
  }

  get(key: string): any {
    return (this._config as any)[key];
  }

  layerPackagePath(): string {
    return path.join(
      this.get('path'),
      this.get('compileDir'), 'layers', this.get('runtimeDir')
    );
  }

  dependencyAbsPath(): string {
    return path.resolve(
      path.join(this.get('path'), this.get('dependenciesPath'))
    );
  }

  toJSON(): NSLayerConfig.CustomConfigs {
    return this._config;
  }
}
