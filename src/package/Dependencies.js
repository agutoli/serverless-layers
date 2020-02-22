const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { execSync } = require('child_process');
const copyFile = require('fs-copy-file'); // node v6.10.3 support

const AbstractService = require('../AbstractService');

class Dependencies extends AbstractService {
  init() {
    const { runtimeDir } = this.plugin.settings;
    this.layersPackageDir = path.join(process.cwd(), this.plugin.settings.compileDir, 'layers', runtimeDir);
  }

  run(cmd) {
    console.log(execSync(cmd, {
      cwd: this.layersPackageDir,
      env: process.env
    }).toString());
  }

  copyProjectFile(filename) {
    this.init();

    if (!fs.existsSync(filename)) {
      this.plugin.log(`[warning] "${filename}" file does not exists!`);
      return true;
    }

    return new Promise((resolve) => {
      copyFile(filename, path.join(this.layersPackageDir, filename), (copyErr) => {
        if (copyErr) throw copyErr;
        return resolve();
      });
    });
  }

  async install() {
    const { copyBeforeInstall } = this.plugin.settings;

    this.init();
    this.plugin.log('Dependencies has changed! Re-installing...');

    await mkdirp.sync(this.layersPackageDir);
    await this.copyProjectFile(this.plugin.settings.dependenciesPath);

    for (const index in copyBeforeInstall) {
      const filename = copyBeforeInstall[index];
      if (!fs.existsSync(filename)) {
        await this.copyProjectFile(filename);
      }
    }

    // custom commands
    if (this.plugin.settings.customInstallationCommand) {
      return this.run(this.plugin.settings.customInstallationCommand);
    }

    const commands = this.plugin.runtimes.getCommands();

    // packages installation
    return this.run(commands[this.plugin.settings.packageManager]);
  }
}

module.exports = Dependencies;
