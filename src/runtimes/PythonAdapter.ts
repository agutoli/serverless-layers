import Err from '../core/errors';

import {NSLayerConfig} from '../core/LayerConfig';
import {RuntimeAdapter, IRuntimeAdapter} from './Adapter';

export class PythonRuntimeAdapter extends RuntimeAdapter implements IRuntimeAdapter {
  // @public
  readonly runtimeId: NSLayerConfig.RuntimeIds = 'python';

  readonly defaultConfig = {
    packageManager: 'pip',
    dependenciesPath: 'requirements.txt',
    packageManagerExtraArgs: '',
    libraryFolder: 'site-packages',
    copyBeforeInstall: [],
    copyAfterInstall: [],
    packageExclude: [
      'yarn.lock',
      'package.json',
      'package-lock.json',
      'node_modules/**'
    ]
  }

  readonly commands = {
    pip: (x:  NSLayerConfig.IPython) => `pip install -r ${x.dependenciesPath} -t .`
  }

  async hasDependenciesDiff(): Promise<boolean> {
    throw new Err.NotImplemented();
  }

  async isCompatibleVersion(): Promise<boolean> {
    throw new Err.NotImplemented();
  }
}
