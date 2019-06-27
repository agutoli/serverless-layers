const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { execSync } = require('child_process');
const copyFile = require('fs-copy-file'); // node v6.10.3 support

const AbstractService = require('../AbstractService');

class Dependencies extends AbstractService {
  init() {
    this.commands = {
      npm: 'npm install --production',
      yarn: 'yarn --production'
    };
    this.nodeJsDir = path.join(process.cwd(), this.plugin.settings.compileDir, 'layers', 'nodejs');
  }

  run(cmd) {
    console.log(execSync(cmd, {
      cwd: this.nodeJsDir,
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
      copyFile(filename, path.join(this.nodeJsDir, filename), (copyErr) => {
        if (copyErr) throw copyErr;
        return resolve();
      });
    });
  }

  async install() {
    this.init();
    this.plugin.log('Dependencies has changed! Re-installing...');

    await mkdirp.sync(this.nodeJsDir);
    await this.copyProjectFile(this.plugin.settings.packagePath);

    if (this.plugin.settings.packageManager === 'npm') {
      await this.copyProjectFile('package-lock.json');
    }

    if (this.plugin.settings.packageManager === 'yarn') {
      await this.copyProjectFile('yarn.lock');
    }

    // custom commands
    if (this.plugin.settings.customInstallationCommand) {
      return this.run(this.plugin.settings.customInstallationCommand);
    }

    // packages installation
    return this.run(this.commands[this.plugin.settings.packageManager]);
  }
}

module.exports = Dependencies;
