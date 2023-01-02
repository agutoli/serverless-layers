const { exec } = require('child_process');

const ruby = require('./ruby');
const nodejs = require('./nodejs');
const python = require('./python');

class Runtimes {
  constructor(plugin) {
    this.plugin = plugin;
    this.compatibleArchitectures = ["x86_64","arm64"];

    const { runtime } = this.plugin.service.provider;

    if (!runtime) {
      this.plugin.error('service.provider.runtime is required!');
      return process.exit(1);
    }

    const patterns = {
      python: [/python/, python],
      nodejs: [/node/, nodejs],
      ruby: [/ruby/, ruby],
    };

    for (const env in patterns) {
      if (patterns[env][0].test(runtime)) {
        this._runtime = new patterns[env][1](this, runtime, env);
        break;
      }
    }

    if (!this._runtime) {
      this.plugin.log(`"${runtime}" runtime is not supported (yet).`);
      return process.exit(1);
    }

    this._runtime.isCompatibleVersion(runtime)
      .then((data) => {
        if (!data.isCompatible) {
          this.plugin.warn('=============================================================');
          this.plugin.warn(`WARN: The current environment and Lambda runtime don't match (current=${data.version.replace('\n', '')} vs runtime=${runtime}).`);
          this.plugin.warn('=============================================================\n');
        }
      });
  }

  init() {
    this._runtime.init();
  }

  run(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (err, stdout, out) => {
        if (err) return reject(err);
        return resolve(stdout || out);
      });
    });
  }

  getDefaultSettings(inboundSettings = {}) {
    if (inboundSettings.packagePath) {
      console.warn('WARN You should use "dependenciesPath" instead of the deprecated "packagePath" param.');
      inboundSettings.dependenciesPath = inboundSettings.packagePath;
    }
    return { ...this._runtime.default, ...inboundSettings };
  }

  getCommands() {
    return this._runtime.commands;
  }

  hasDependenciesChanges() {
    return this._runtime.hasDependenciesChanges();
  }
}

module.exports = Runtimes;
