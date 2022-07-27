import path from 'path';

export class LayerConfig {
  arn?: string;

  _config: Config.CustomConfigs;

  constructor(configHey: string, _config: Config.CustomConfigs) {
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

  get<T>(key: string): T {
    return (this._config[key as Config.CustomConfigsKey] as unknown) as T;
  }

  layerPackagePath(): string {
    return path.join(
      this.get<string>('path'),
      this.get<string>('compileDir'),
      'layers',
      this.get<string>('runtimeDir')
    );
  }

  dependencyAbsPath(): string {
    return path.resolve(
      path.join(
        this.get<string>('path'),
        this.get<string>('dependenciesPath')
      )
    );
  }

  toJSON(): Config.CustomConfigs {
    return this._config;
  }
}
