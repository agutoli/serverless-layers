const nodejs = require('./nodejs');
const python = require('./python');

class Runtimes {
  constructor(plugin) {
    this.plugin = plugin;

    const { runtime } = this.plugin.service.provider;

    const patterns = {
      python: [/python/, python],
      nodejs: [/node/, nodejs],
    };

    for (const env in patterns) {
      if (patterns[env][0].test(runtime)) {
        this._runtime = new patterns[env][1](this.plugin, runtime, env);
        break;
      }
    }
  }

  install() {
    return this._runtime.install();
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

  hasDependencesChanged() {
    return this._runtime.hasDependencesChanged();
  }
}

module.exports = Runtimes;
