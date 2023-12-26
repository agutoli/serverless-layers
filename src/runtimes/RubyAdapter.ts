import Err from '../core/errors';

import {Config} from '../types/config';
import {RuntimeAdapter} from './Adapter';

export class RubyRuntimeAdapter extends RuntimeAdapter implements IRuntimeAdapter {
  // @public
  readonly runtimeId: Config.RuntimeIds = 'ruby';

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
    optimization: {
      cleanupPatterns: []
    },
    serverless: {
      package: {
        patterns: [
          '!.gitignore',
          '!README.md',
          '!.vscode/',
          '!.idea/',
          'yarn.lock',
          'package.json',
          'package-lock.json',
          'node_modules/**',
          'vendor/**',
          '.bundle'
        ],
        individually: true
      }
    }
  }

  readonly commands = {
    bundle: (x: Config.IRuby) => `bundle install --gemfile=${x.dependenciesPath} --path=./`,
  }

  async hasDependenciesDiff(): Promise<boolean> {
    throw new Err.NotImplemented();
  }

  async isCompatibleVersion(): Promise<boolean> {
    throw new Err.NotImplemented();
  }
}
