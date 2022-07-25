import {System} from '../core/System';
import {LayerConfig} from '../core/LayerConfig';
import {IRuntimeAdapter} from '../runtimes/Adapter';

export class PackageUserCase {
  static async packLayer(
    runtime: IRuntimeAdapter,
    layerConfig: LayerConfig
  ): Promise<void> {

    console.log({runtime, layerConfig});
    // process.exit(0);
  }
}
