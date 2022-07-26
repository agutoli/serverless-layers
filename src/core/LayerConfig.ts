import path from 'path';

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
