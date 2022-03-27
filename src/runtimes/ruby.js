const fs = require('fs');
const path = require('path');


class RubyRuntime {
  constructor(parent, runtime, runtimeDir) {
    this.parent = parent;
    this.plugin = parent.plugin;

    this.default = {
      runtime,
      runtimeDir,
      libraryFolder: 'gems',
      packageManager:  'bundle',
      packageManagerExtraArgs: '',
      dependenciesPath: 'Gemfile',
      compatibleRuntimes: [runtime],
      compatibleArchitectures: parent.compatibleArchitectures,
      copyBeforeInstall: [
        'Gemfile.lock'
      ],
      copyAfterInstall: [
        { from: 'ruby', to: 'gems' }
      ],
      packageExclude: [
        'node_modules/**',
        'package.json',
        'package-lock.json',
        'vendor/**',
        '.bundle'
      ]
    };

    this.commands = {
      bundle: `bundle install --gemfile=${this.default.dependenciesPath} --path=./`,
    };
  }

  init() {
    const { dependenciesPath } = this.plugin.settings;

    const localpackageJson = path.join(
      process.cwd(),
      dependenciesPath
    );

    try {
      this.localPackage = fs.readFileSync(localpackageJson).toString();
    } catch (e) {
      this.plugin.log(`Error: Can not find ${localpackageJson}!`);
      process.exit(1);
    }
  }

  async isCompatibleVersion(runtime) {
    const osVersion = await this.parent.run('ruby --version');
    const [runtimeVersion] = runtime.match(/[0-9].[0-9]/);
    return {
      version: osVersion,
      isCompatible: osVersion.startsWith(`ruby ${runtimeVersion}`)
    };
  }

  isDiff(depsA, depsB) {
    if (!depsA) {
      return true;
    }
    return depsA !== depsB;
  }

  async hasDependenciesChanges() {
    const remotePackage = await this.plugin.bucketService.downloadDependencesFile();

    let isDifferent = true;

    if (remotePackage) {
      this.plugin.log(`Comparing ${this.default.dependenciesPath} dependencies...`);
      isDifferent = await this.isDiff(remotePackage, this.localPackage);
    }

    return isDifferent;
  }
}

module.exports = RubyRuntime;
