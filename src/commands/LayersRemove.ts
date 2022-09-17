import Err from '../core/errors';
import type Plugin from 'serverless/classes/Plugin';
import {LayerConfig} from '../core/LayerConfig';

type Injection = {
  facade: IServerlessFacade;
  logging: Plugin.Logging;
  layerConfig: LayerConfig;
};

export async function UseCase ({
  facade,
  logging,
  layerConfig
} : Injection): Promise<void> {
  const cliOptions = facade.getOptions();

  const options = {
    'layer-name': null,
    ...cliOptions
  };

  // Skip layers that doesn't match with option "layer-name"
  if (options['layer-name'] !== layerConfig.get<string>('layerConfigKey')) {
    return;
  }


}
