import type Serverless from 'serverless';
import type AwsProvider from 'serverless/aws';
import type Service from 'serverless/classes/Service';

/**
 * Facade is a structural design pattern that provides a simplified
 * (but limited) interface to a complex system of classes, library
 * or framework.
 */
export class ServerlessFacade implements IServerlessFacade {
  private _serverless: Serverless;

  private _options: Serverless.Options;

  private _provider: AwsProvider;

  private _service: Service;

  constructor(serverless: Serverless, options: Serverless.Options) {
    this._provider = serverless.getProvider('aws');
    this._options = options;
    this._serverless = serverless;
    this._service = serverless.service;
  }

  async awsRequest(serviceAction: string, params: KeyValue<unknown>): Promise<KeyValue<unknown>> {
    const [service, action] = serviceAction.split(':');
    return this._provider.request(service, action, params);
  }

  /***
   * Returns the current runtime
   */
  getRuntime(): string | undefined {
    return this._service.provider.runtime;
  }

  getFunctions(): AwsProvider.Functions {
    return this._service.functions;
  }

  attachLayerByArn(arn: string): void {
    const functions = this.getFunctions();

    for (const funcName in functions) {
      if (functions[funcName].layers) {
        const arns = new Set(functions[funcName].layers)
        functions[funcName].layers = Array.from(arns);
      } else {
        functions[funcName].layers = [arn];
      }
    }
  }

  getCustomConfigs(): KeyValue<Config.CustomConfigs>[] {
    const custom = this._service.custom as KeyValue<unknown>;
    const value = custom && custom['serverless-layers'] || [];
    return Array.isArray(value)
      ? value : [{'default': value}];
  }

  getServerlessVersion(): string {
    return this._serverless.getVersion();
  }

  defineCustomProperties(properties: KeyValue<unknown>): void {
    this._serverless.configSchemaHandler.defineCustomProperties({
      type: 'object',
      properties: {
        'serverless-layers': properties
      },
      required: ['serverless-layers'],
    });
  }

  /**
   * @public
   */
  getDeploymentBucketName(): string | undefined {
    const {deploymentBucket} = this._service.provider as AwsProvider.Provider;

    if (typeof deploymentBucket === 'string') {
        return deploymentBucket;
    }

    return deploymentBucket?.name;
  }
}
