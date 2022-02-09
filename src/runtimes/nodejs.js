const path = require('path');

class NodeJSRuntime {
  constructor(parent, runtime, runtimeDir) {
    this.parent = parent;
    this.plugin = parent.plugin;

    this.default = {
      runtime,
      runtimeDir,
      libraryFolder: 'node_modules',
      packageManager:  'npm',
      packageManagerExtraArgs: '',
      dependenciesPath: 'package.json',
      compatibleRuntimes: [runtimeDir],
      copyBeforeInstall: [
        '.npmrc',
        'yarn.lock',
        'package-lock.json'
      ],
      packageExclude: [
        'node_modules/**',
      ]
    };

    this.commands = {
      npm: 'npm install --production --only=prod',
      yarn: 'yarn --production'
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
}

module.exports = NodeJSRuntime;
