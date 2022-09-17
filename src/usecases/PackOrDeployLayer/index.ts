import type Plugin from 'serverless/classes/Plugin';

import {State} from '../../core/State';
import {LayerConfig} from '../../core/LayerConfig';

// auxiliar usecases
import * as ScenarioStaticLayerArnOption from './ScenarioStaticLayerArnOption';

type Injection = {
  state: State,
  facade: IServerlessFacade,
  runtime: IRuntimeAdapter,
  layerConfig: LayerConfig
  logging: Plugin.Logging;
};

export async function UseCase ({
  // state,
  facade,
  // runtime,
  logging,
  layerConfig
} : Injection): Promise<void> {
  /**
   * Scenario: Attaching existent layer ARN to functions
   * - The "arn" option should be a valid ARN string
   * - If no functions availeble on stack, it will be ignored.
   */
  if (layerConfig.arn) {
    await ScenarioStaticLayerArnOption.UseCase(layerConfig.arn, { facade });
    return ;
  }
}
