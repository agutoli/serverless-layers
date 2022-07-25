import type Serverless from 'serverless';
import type Aws from 'serverless/plugins/aws/provider/awsProvider';
import type Service from 'serverless/classes/Service';
import type {NSLayerConfig} from './LayerConfig';

export interface IServerlessFacade {
  getRuntime(): string | undefined;
  awsRequest(serviceAction: string, params: any, opts: any): Promise<any>;
  attachLayerByArn(arn: string): void;
  getServerlessVersion(): string;
  getCustomConfigs(): NSLayerConfig.CustomConfigs;
  defineCustomProperties(properties: any): void;
  getDeploymentBucketName(): string;
};

/**
 * Facade is a structural design pattern that provides a simplified
 * (but limited) interface to a complex system of classes, library
 * or framework.
 */
export class ServerlessFacade implements IServerlessFacade {
  /**
   * @private
   */
  private _serverless: Serverless;

  /**
   * @private
   */
  private _options: Serverless.Options;

  /**
   * @private
   */
  private _aws: Aws;

  /**
   * @private
   */
  private _service: Service;

  /**
   * @param {Serverless} serverless
   * @param {Options} options
   */
  constructor(serverless: Serverless, options: Serverless.Options) {
    this._options = options;
    this._serverless = serverless;
    this._service = serverless.service;
    this._aws = this._serverless.getProvider('aws');
  }

  async awsRequest(serviceAction: string, params: any, opts: any = {}): Promise<any> {
    const [service, action] = serviceAction.split(':');
    return this._aws.request(service, action, params);
  }

  /***
   * Returns the current runtime
   */
  getRuntime(): string | undefined {
    return this._service.provider.runtime;
  }

  attachLayerByArn(arn: string): void {
    console.log(this._aws);

    // const {functions, provider} = this._service;

    // for (let func in functions) {
    //   functions[func].layers = functions[func].layers || [];
    //   functions[func].layers.push(arn);
    //   // functions[func].layers = Array.from(new Set(functions[func].layers));
    // }

    // console.log(functions);
  }

  getCustomConfigs(): NSLayerConfig.CustomConfigs {
    return this._service.custom['serverless-layers'] || {};
  }

  getServerlessVersion(): string {
    return this._serverless.getVersion();
  }

  defineCustomProperties(properties: any): void {
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
  getDeploymentBucketName(): string {
    const customConfigs = this.getCustomConfigs();

    if (customConfigs.layersDeploymentBucket) {
      return customConfigs.layersDeploymentBucket;
    }

    return (this._service.provider as any).deploymentBucket;
  }
}
