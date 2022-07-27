import {State} from '../../core/State';
import {LayerConfig} from '../../core/LayerConfig';

// auxiliar usecases
import * as AddLayerToServerless from './AddLayerToServerless';

type Injection = {
  state: State,
  facade: IServerlessFacade,
  runtime: IRuntimeAdapter,
  layerConfig: LayerConfig
};

export async function UseCase ({
  state,
  facade,
  runtime,
  layerConfig
} : Injection): Promise<void> {
  const arn = layerConfig.arn;
  if (arn) {
    await AddLayerToServerless.UseCase(arn, { facade });
    return ;
  }

  console.log({ runtime, state });
}
