import type Plugin from 'serverless/classes/Plugin';

import {LayerConfig} from '../../core/LayerConfig';

type Injection = {
  facade: IServerlessFacade;
  logging: Plugin.Logging;
  layerConfig: LayerConfig;
};

export async function UseCase ({
  facade,
  layerConfig
} : Injection): Promise<void> {
  const cliOptions = facade.getOptions();

  const options = {
    'marker': null,
    'max-items': null,
    'compatible-runtime': layerConfig.get('runtime'),
    'compatible-architecture': null,
    ...cliOptions
  };

  // ignores compatible-runtime, and
  // returns all compatible runtime
  if (options['compatible-runtime'] === 'all') {
    options['compatible-runtime'] = null;
  }

  const layers = await facade.awsRequest('Lambda:listLayers', {
    Marker: options['marker'],
    MaxItems: options['max-items'],
    CompatibleRuntime: options['compatible-runtime'],
    CompatibleArchitecture: options['compatible-architecture']
  });

  console.log(layers);
}
