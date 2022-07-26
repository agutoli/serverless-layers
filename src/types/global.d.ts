interface KeyValue {
  [key: string]: any;
}

interface IServerlessFacade {
  getRuntime(): string | undefined;
  getFunctions():  AwsProvider.Functions;
  awsRequest(serviceAction: string, params: unknown, opts: unknown): Promise<unknown>;
  attachLayerByArn(arn: string): void;
  getServerlessVersion(): string;
  getCustomConfigs(): NSLayerConfig.CustomConfigs;
  defineCustomProperties(properties: KeyValue): void;
  getDeploymentBucketName(): string | undefined;
}

interface IRuntimeAdapter {
  readonly runtimeId: NSLayerConfig.RuntimeIds;
  readonly defaultConfig: {[key: string]: unknown};
  loadLayersConfig(config: any): void;
  getLayersConfig(): LayerConfig[];
  hasDependenciesDiff(): Promise<boolean>;
  isCompatibleVersion(): Promise<boolean>;
}
