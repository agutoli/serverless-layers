const path = require('path');

class NodeJSRuntime {
  constructor(plugin, runtime, runtimeDir) {
    this.plugin = plugin;

    this.default = {
      runtime,
      runtimeDir,
      packageManager:  'npm',
      dependenciesPath: 'package.json',
      compatibleRuntimes: [runtimeDir],
      copyBeforeInstall: [
        'yarn.lock',
        'package-lock.json'
      ],
      packageExclude: [
        'node_modules/**',
      ]
    };

    this.commands = {
      npm: 'npm install --production',
      yarn: 'yarn --production'
    };

    const localpackageJson = path.join(
      process.cwd(),
      this.default.dependenciesPath
    );

    try {
      this.localPackage = require(localpackageJson);
    } catch (e) {
      this.log(`Error: Can not find ${localpackageJson}!`);
      process.exit(1);
    }
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

  async hasDependencesChanged() {
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
