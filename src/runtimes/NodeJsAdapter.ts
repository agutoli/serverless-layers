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
    optimization: {
      cleanupPatterns: [
        "node_modules/aws-sdk/**",
        "node_modules/@types/**",
        "node_modules/**/.github",
        "node_modules/**/.lint",
        "node_modules/**/Gruntfile.js",
        "node_modules/**/.jshintrc",
        "node_modules/**/.nycrc",
        "node_modules/**/.nvmrc",
        "node_modules/**/.editorconfig",
        "node_modules/**/.npmignore",
        "node_modules/**/bower.json",
        "node_modules/**/.eslint*",
        "node_modules/**/.gitignore",
        "node_modules/**/*.ts",
        "node_modules/**/README.*",
        "node_modules/**/LICENSE",
        "node_modules/**/LICENSE.md",
        "node_modules/**/CHANGES",
        "node_modules/**/HISTORY.md",
        "node_modules/**/CHANGES.md",
        "node_modules/**/CHANGELOG.md",
        "node_modules/**/sponsors.md",
        "node_modules/**/license.txt",
        "node_modules/**/tsconfig.json",
        "node_modules/**/test/*.js",
        "node_modules/**/*.test.js",
        "node_modules/**/*.spec.js",
        "node_modules/**/.travis.y*ml",
        "node_modules/**/yarn.lock",
        "node_modules/**/.package-lock.json",
        "node_modules/**/*.md",
      ]
    },
    // sls defaults presets when not defined
    serverless: {
      package: {
        patterns: [
          '!node_modules/**'
        ],
        individually: true
      }
    }
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
