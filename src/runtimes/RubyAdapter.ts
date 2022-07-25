import Err from '../core/errors';

import {NSLayerConfig} from '../core/LayerConfig';
import {RuntimeAdapter, IRuntimeAdapter} from './Adapter';

export class RubyRuntimeAdapter extends RuntimeAdapter implements IRuntimeAdapter {
  // @public
  readonly runtimeId: NSLayerConfig.RuntimeIds = 'ruby';

  readonly defaultConfig = {
    packageManager:  'bundle',
    dependenciesPath: 'Gemfile',
    packageManagerExtraArgs: '',
    libraryFolder: 'gems',
    copyBeforeInstall: [
      'Gemfile.lock'
    ],
    copyAfterInstall: [
      { from: 'ruby', to: 'gems' }
    ],
    packageExclude: [
      'yarn.lock',
      'package.json',
      'package-lock.json',
      'node_modules/**',
      'vendor/**',
      '.bundle'
    ]
  }

  readonly commands = {
    bundle: (x: NSLayerConfig.IRuby) => `bundle install --gemfile=${x.dependenciesPath} --path=./`,
  }

  async hasDependenciesDiff(): Promise<boolean> {
    throw new Err.NotImplemented();
  }

  async isCompatibleVersion(): Promise<boolean> {
    throw new Err.NotImplemented();
  }
}
