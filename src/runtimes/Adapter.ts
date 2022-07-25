import Err from '../core/errors';
import {NSLayerConfig, LayerConfig} from '../core/LayerConfig';

export interface IRuntimeAdapter {
  readonly runtimeId: NSLayerConfig.RuntimeIds;
  readonly defaultConfig: {[key: string]: unknown};

  loadLayersConfig(config: any): void;
  getLayersConfig(): LayerConfig[];
  hasDependenciesDiff(): Promise<boolean>;
  isCompatibleVersion(): Promise<boolean>;
}

export abstract class RuntimeAdapter {
  _layersConfig: LayerConfig[] = [];

  loadLayersConfig(layersConfig: LayerConfig[]): void {
    this._layersConfig = layersConfig;
  }

  getLayersConfig(): LayerConfig[] {
    return this._layersConfig;
  }
}
