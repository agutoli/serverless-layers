import {LayerConfig} from '../../core/LayerConfig';

export function layersDeployUseCase(
  facade: IServerlessFacade,
  config: LayerConfig
): void {
  console.log("calling layers deploy");

  process.exit(0);
}
