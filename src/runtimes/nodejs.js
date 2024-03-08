const path = require('path');
const crypto = require('crypto');

class NodeJSRuntime {
  constructor(parent, runtime, runtimeDir) {
    this.parent = parent;
    this.plugin = parent.plugin;

    this.default = {
      runtime,
      runtimeDir,
      libraryFolder: 'node_modules',
      packageManager: 'npm',
      packageManagerExtraArgs: '',
      dependenciesPath: 'package.json',
      compatibleRuntimes: [runtimeDir],
      compatibleArchitectures: parent.compatibleArchitectures,
      copyBeforeInstall: [
        '.npmrc',
        'yarn.lock',
        'package-lock.json'
      ],
      packagePatterns: [
        '!node_modules/**',
      ],
      layerOptimization: {
        cleanupPatterns: [
          "node_modules/**/.github",
          "node_modules/**/.git/*",
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
          "node_modules/**/*.test.js",
          "node_modules/**/*.spec.js",
          "node_modules/**/.travis.y*ml",
          "node_modules/**/yarn.lock",
          "node_modules/**/.package-lock.json",
          "node_modules/**/*.md",
        ]
      }
    };

    this.commands = {
      npm: 'npm install --production --only=prod',
      yarn: 'yarn --production',
      pnpm: 'pnpm install --prod'
    };
  }

  init() {
    const { dependenciesPath } = this.plugin.settings;

    const localpackageJson = path.join(
      process.cwd(),
      dependenciesPath
    );

    try {
      this.localPackage = require(localpackageJson);
    } catch (e) {
      this.plugin.log(`Error: Can not find ${localpackageJson}!`);
      process.exit(1);
    }
  }

  async isCompatibleVersion(runtime) {
    const osVersion = await this.parent.run('node --version');
    const [runtimeVersion] = runtime.match(/([0-9]+)\./);
    return {
      version: osVersion,
      isCompatible: osVersion.startsWith(`v${runtimeVersion}`)
    };
  }

  isDiff(depsA, depsB) {
    if (!depsA) {
      return true;
    }

    const depsKeyA = Object.keys(depsA);
    const depsKeyB = Object.keys(depsB);
    const isSizeEqual = depsKeyA.length === depsKeyB.length;

    if (!isSizeEqual) return true;

    let hasDifference = false;
    Object.keys(depsA).forEach(dependence => {
      if (depsA[dependence] !== depsB[dependence]) {
        hasDifference = true;
      }
    });

    return hasDifference;
  }

  async hasDependenciesChanges() {
    const remotePackage = await this.plugin.bucketService.downloadDependencesFile();

    let isDifferent = true;

    if (remotePackage) {
      const parsedRemotePackage = JSON.parse(remotePackage);
      const { dependencies } = parsedRemotePackage;
      this.plugin.log('Comparing package.json dependencies...');
      isDifferent = await this.isDiff(dependencies, this.localPackage.dependencies);
    }

    return isDifferent;
  }

  getDependenciesChecksum() {
    return crypto.createHash('md5').update(JSON.stringify(this.localPackage.dependencies)).digest('hex');
  }
}

module.exports = NodeJSRuntime;
