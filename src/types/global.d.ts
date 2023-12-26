type KeyValue<T> = {
  [key: string]: T;
}

type ValueOf<T> = T[keyof T]

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

type Test = Entries<Obj>;

type CallableHook = (n: LayerConfig) => Promise<void>;

interface IServerlessFacade {
  getRuntime(): string | undefined;
  getFunctions():  AwsProvider.Functions;
  getOptions(): Serverless.Options;
  awsRequest<T>(serviceAction: string, params: unknown): Promise<T>;
  attachLayerByArn(arn: string): void;
  getServerlessVersion(): string;
  getPackagePatterns(): string[];
  getCustomConfigs(): KeyValue<Config.CustomConfigs>[];
  getPackagePatterns(): string[];
  defineCustomProperties(properties: KeyValue): void;
  getDeploymentBucketName(): string | undefined;
  updatePackagePatterns(patterns: string[]): void;
}

interface IRuntimeAdapter {
  readonly commands: KeyValue;
  readonly runtimeId: Config.RuntimeIds;
  readonly defaultConfig: {[key: string]: unknown};
  loadLayersConfig(config: LayerConfig): void;
  getLayersConfig(): LayerConfig[];
  hasDependenciesDiff(): Promise<boolean>;
  isCompatibleVersion(): Promise<boolean>;
}
