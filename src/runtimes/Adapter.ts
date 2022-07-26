import {LayerConfig} from '../core/LayerConfig';

export abstract class RuntimeAdapter {
  _layersConfig: LayerConfig[] = [];

  loadLayersConfig(layersConfig: LayerConfig[]): void {
    this._layersConfig = layersConfig;
  }

  getLayersConfig(): LayerConfig[] {
    return this._layersConfig;
  }
}
