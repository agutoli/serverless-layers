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
  state,
  facade,
  runtime,
  logging,
  layerConfig
} : Injection): Promise<void> {
  logging.log.error("error: logs");
  logging.log.warning("warning: logs");
  logging.log.notice("notice: logs");
  logging.log.info("info: logs");
  logging.log.debug("debug: logs");
  logging.log.verbose("verbose: logs");
  logging.log.success("success: logs");
  logging.writeText('writeText: logs');

  const mainProgress = logging.progress.get('main');

  let x = 0;
  setInterval(function(){
    mainProgress.notice(`update: ${x}`);
    x++;
  }, 100);

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
