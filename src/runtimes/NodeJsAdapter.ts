import Err from '../core/errors';

import {RuntimeAdapter} from './Adapter';

export class NodeJsRuntimeAdapter extends RuntimeAdapter implements IRuntimeAdapter {
  // @public
  readonly runtimeId: Config.RuntimeIds = 'nodejs';

  readonly defaultConfig = {
    packageManager: 'npm',
    dependenciesPath: 'package.json',
    packageManagerExtraArgs: '',
    libraryFolder: 'node_modules',
    copyBeforeInstall: [
      '.npmrc',
      'yarn.lock',
      'package-lock.json'
    ],
    copyAfterInstall: [],
    packageExclude: [
      'node_modules/**',
    ]
  }

  readonly commands = {
    npm: () => 'npm install --production --only=prod',
    yarn: () => 'yarn --production',
    pnpm: () => 'pnpm install --prod'
  }

  async hasDependenciesDiff(): Promise<boolean> {
    throw new Err.NotImplemented();
  }

  async isCompatibleVersion(): Promise<boolean> {
    throw new Err.NotImplemented();
  }
}
