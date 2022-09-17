declare namespace Config {
  /**
   * Supported Runtimes
   */
  type RuntimeIds = 'nodejs' | 'python' | 'ruby';

  /**
   * The common configurations across
   * all supported languages.
   */
  interface ICommon  extends object {
    arn?: string;
    path: string;
    runtime: string;
    runtimeDir: string;
    compileDir: string;
    layerConfigKey: string;
    copyBeforeInstall: Array<string>;
    copyAfterInstall: Array<string>;
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
  type CustomConfigsKey = keyof CustomConfigs;
  type CustomConfigsValue = ValueOf<CustomConfigs>;
}
