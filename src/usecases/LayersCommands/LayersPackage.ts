import Err from '../../core/errors';
import type Plugin from 'serverless/classes/Plugin';
import {LayerConfig} from '../../core/LayerConfig';

import * as InstallDependencies from '../PackOrDeployLayer/InstallDependencies';

type Injection = {
  facade: IServerlessFacade;
  runtime: IRuntimeAdapter,
  logging: Plugin.Logging;
  layerConfig: LayerConfig;
};

export async function UseCase ({
  facade,
  runtime,
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

  // can not package a layer when
  // using "arn" option. Theres nothing
  // to package when using "arn" string.
  if (layerConfig.arn) {
    throw new Err.CommandError(`The "${options['layer-name']}" layer is using a static arn "${layerConfig.arn}". Nothing to package.`);
  }

  // install package manager dependencies
  await InstallDependencies.UseCase({
    runtime,
    logging,
    layerConfig
  });
}
