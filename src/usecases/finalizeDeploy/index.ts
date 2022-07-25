import {IServerlessFacade} from '../../core/Facade';
import {LayerConfig} from '../../core/LayerConfig';

export function finalizeDeployUseCase(
  facade: IServerlessFacade,
  config: LayerConfig
): void {
  console.log("calling finalize deploy");
}
