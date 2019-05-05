const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const exec = require('child_process').execSync;
const copyFile = require('fs-copy-file'); // v6.10.3 support

const AbstractService = require('../AbstractService');


class Dependencies extends AbstractService {
  init() {
    this.commands = {
      npm: 'npm install',
      yarn: 'yarn'
    };
    this.initialCwd = process.cwd();
    this.nodeJsDir = path.join(process.cwd(), this.plugin.settings.compileDir, 'layers', 'nodejs');
  }

  run(cmd, options = []) {
    console.log(exec(cmd, options).toString());
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

    process.chdir(this.nodeJsDir);

    // packages installation
    this.run(this.commands[this.plugin.settings.packageManager]);

    process.chdir(this.initialCwd);
  }
}

module.exports = Dependencies;
