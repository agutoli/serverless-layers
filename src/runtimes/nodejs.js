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
      dependenciesPath: 'package.json',
      dependenciesLockPath: 'yarn.lock',
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
    const { dependenciesPath, dependenciesLockPath } = this.plugin.settings;

    const localpackageJson = path.join(
      process.cwd(),
      dependenciesPath
    );

    const localpackageLockJson = path.join(
      process.cwd(),
      dependenciesLockPath
    );

    try {
      this.localPackage = require(localpackageJson);
    } catch (e) {
      this.plugin.log(`Error: Can not find ${localpackageJson} or ${localpackageLockJson}!`);
      process.exit(1);
    }

    try {
      this.localPackageLock = require(localpackageLockJson);
      // eslint-disable-next-line no-empty
    } catch (e) {}
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
      const { dependencies, version } = parsedRemotePackage;
      this.plugin.log('Comparing package.json dependencies...');
      const isDifferentPackageJson = await
      this.isDiff(dependencies, this.localPackage.dependencies);

      let isDifferentPackageLock = false;

      if (this.localPackageLock) {
        const { dependenciesLockPath } = this.plugin.settings;
        const remotePackageLock = await this.plugin.bucketService.getFile(dependenciesLockPath);
        if (remotePackageLock) {
          const parsedRemotePackageLock = JSON.parse(remotePackageLock);
          const lockDependencies = Object.fromEntries(
            Object.entries(parsedRemotePackageLock.dependencies)
              .filter((dependency) => dependency[1].dev !== true)
          );
          const localLockDependencies = Object.fromEntries(
            Object.entries(this.localPackageLock.dependencies)
              .filter((dependency) => dependency[1].dev !== true)
          );

          isDifferentPackageLock = JSON.stringify(lockDependencies)
            !== JSON.stringify(localLockDependencies);
        } else {
          isDifferentPackageLock = true;
        }
      }
      isDifferent = version !== this.localPackage.version
        || isDifferentPackageJson
        || isDifferentPackageLock;
    }

    return isDifferent;
  }
}

module.exports = NodeJSRuntime;
