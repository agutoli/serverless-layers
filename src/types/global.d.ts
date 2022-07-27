type KeyValue<T> = {
  [key: string]: T;
}

type ValueOf<T> = T[keyof T]

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

type Test = Entries<Obj>;

interface IServerlessFacade {
  getRuntime(): string | undefined;
  getFunctions():  AwsProvider.Functions;
  awsRequest(serviceAction: string, params: unknown, opts: unknown): Promise<unknown>;
  attachLayerByArn(arn: string): void;
  getServerlessVersion(): string;
  getCustomConfigs(): KeyValue<Config.CustomConfigs>[];
  defineCustomProperties(properties: KeyValue): void;
  getDeploymentBucketName(): string | undefined;
}

interface IRuntimeAdapter {
  readonly runtimeId: Config.RuntimeIds;
  readonly defaultConfig: {[key: string]: unknown};
  loadLayersConfig(config: LayerConfig): void;
  getLayersConfig(): LayerConfig[];
  hasDependenciesDiff(): Promise<boolean>;
  isCompatibleVersion(): Promise<boolean>;
}