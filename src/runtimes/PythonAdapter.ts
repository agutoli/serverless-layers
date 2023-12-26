import Err from '../core/errors';

import {RuntimeAdapter} from './Adapter';
import {LayerConfig} from '../core/LayerConfig';

export class PythonRuntimeAdapter extends RuntimeAdapter implements IRuntimeAdapter {
  // @public
  readonly runtimeId: Config.RuntimeIds = 'python';

  readonly defaultConfig = {
    packageManager: 'pip',
    dependenciesPath: 'requirements.txt',
    packageManagerExtraArgs: '',
    libraryFolder: 'site-packages',
    copyBeforeInstall: [],
    copyAfterInstall: [],
    optimization: {
      cleanupPatterns: []
    },
    serverless: {
      package: {
        individually: true
      }
    }
  }

  readonly commands = {
    pip: (x: LayerConfig) => `pip install -r ${x.get<string>('dependenciesPath')} -t .`
  }

  async hasDependenciesDiff(): Promise<boolean> {
    throw new Err.NotImplemented();
  }

  async isCompatibleVersion(): Promise<boolean> {
    throw new Err.NotImplemented();
  }
}
