import type Plugin from 'serverless/classes/Plugin';

import {LayerConfig} from '../../core/LayerConfig';

type Injection = {
  facade: IServerlessFacade
  layerConfig: LayerConfig
  logging: Plugin.Logging;
};

export function UseCase({ logging, facade, layerConfig }: Injection): void {
  // const functions = facade.updatePackagePatterns);
  const definedPatterns = facade.getPackagePatterns();
  const runtimePatterns = layerConfig.getRuntimePackagePatterns();
  console.log('definedPatterns:::', definedPatterns);

  const patterns = Array.from(new Set(definedPatterns.concat(runtimePatterns)));

  // set/update package patterns
  logging.log.notice("Update package.patterns...");
  facade.updatePackagePatterns(patterns);
}
