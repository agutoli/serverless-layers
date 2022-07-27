import {LayerConfig} from './LayerConfig';

export class State {
  private _facade: IServerlessFacade;
  private _layerConfig: LayerConfig;

  constructor(facade: IServerlessFacade, layerConfig: LayerConfig) {
    this._facade = facade;
    this._layerConfig = layerConfig;
  }

  async getSettings(): Promise<void> {
    console.log(this._layerConfig);

    // return this._facade.awsRequest('S3:getObject', {
    //   Bucket: '',
    //   Key: this.zipFileKeyName,
    // });
  }
}
