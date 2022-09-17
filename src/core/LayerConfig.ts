import path from 'path';

export class LayerConfig {
  arn?: string;

  _config: Config.CustomConfigs;

  constructor(layerConfigKey: string, _config: Config.CustomConfigs) {
    this._config = Object.assign({
      layerConfigKey,
      path: process.cwd(),
      runtime: null,
      functions: null,
      forceInstall: false,
      dependencyInstall: true,
      compileDir: ".serverless",
      customInstallationCommand: null,
      compatibleArchitectures: ["x86_64", "arm64"],
    }, _config);

    // assign values to class
    Object.assign(this, this._config);
  }

  get<T>(key: Config.CustomConfigsKey): T {
    return (this._config[key as Config.CustomConfigsKey] as unknown) as T;
  }

  compileDirAbsPath(): string {
    return path.join(
      this.get<string>('path'),
      this.get<string>('compileDir')
    );
  }

  layerPackagePath(): string {
    return path.join(
      this.get<string>('path'),
      this.get<string>('compileDir'),
      'layers',
      this.get<string>('runtimeDir')
    );
  }

  layerArtifactPath(): string {
    return path.join(
      this.compileDirAbsPath(),
      `${this.get<string>('layerConfigKey')}-artifact.zip`
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
