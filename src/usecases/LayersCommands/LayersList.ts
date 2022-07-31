import type Plugin from 'serverless/classes/Plugin';
import type Lambda from 'aws-sdk/clients/lambda';

import {LayerConfig} from '../../core/LayerConfig';

type Injection = {
  facade: IServerlessFacade;
  runtime: IRuntimeAdapter,
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
    'marker': null,
    'max-items': null,
    'compatible-runtime': layerConfig.get<string>('runtime'),
    'compatible-architecture': null,
    ...cliOptions
  };

  // ignores compatible-runtime, and
  // returns all compatible runtime
  if (options['compatible-runtime'] === 'all') {
    logging.log.verbose('layers-list: Getting all compatible-runtime');
    options['compatible-runtime'] = null;
  }

  logging.log.verbose('layers-list: Invoking AWS Lambda:listLayers');
  const params = {
    Marker: options['marker'],
    MaxItems: options['max-items'],
    CompatibleRuntime: options['compatible-runtime'],
    CompatibleArchitecture: options['compatible-architecture']
  };

  const layers = await facade.awsRequest<Lambda.Types.ListLayersResponse>('Lambda:listLayers', params);

  if (layers && layers.Layers) {
    const tabular = [];
    for (const layer of layers.Layers) {
      tabular.push({
        Created: layer?.LatestMatchingVersion?.CreatedDate?.split('T')[0],
        Version: layer?.LatestMatchingVersion?.Version,
        Arn: layer.LayerArn,
        Architectures: (layer?.LatestMatchingVersion?.CompatibleArchitectures||[]).join(', '),
        Description: layer?.LatestMatchingVersion?.Description
      });
    }

    logging.log.notice('Listing layers:\n');

    console.group('Params:');
    console.log(JSON.stringify(params));
    console.groupEnd();

    console.group('NextMarker:');
    console.log(layers.NextMarker);
    console.groupEnd();

    console.group('Results:');
    console.table(tabular);
    console.groupEnd();
  }
}
