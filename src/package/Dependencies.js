const fs = require('fs');
const fsExtra = require('fs-extra');
const glob = require('glob');
const path = require('path');
const mkdirp = require('mkdirp');
const { execSync } = require('child_process');
const copyFile = require('fs-copy-file'); // node v6.10.3 support

const AbstractService = require('../AbstractService');

function resolveFile(from) {
  return new Promise((resolve, reject) => {
    glob(from, {}, (err, files) => {
      if (err) return reject();
      return resolve(files);
    });
  });
}

class Dependencies extends AbstractService {
  init() {
    const { runtimeDir } = this.plugin.settings;
    this.layersPackageDir = path.join(process.cwd(), this.plugin.settings.compileDir, 'layers', runtimeDir);
  }

  async run(cmd) {
    const output = execSync(cmd, {
      cwd: this.layersPackageDir,
      env: process.env
    }).toString();
    return output;
  }

  copyProjectFile(filename) {
    this.init();

    if (!fs.existsSync(filename)) {
      this.plugin.warn(`[warning] "${filename}" file does not exists!`);
      return true;
    }

    return new Promise((resolve) => {
      copyFile(filename, path.join(this.layersPackageDir, path.basename(filename)), (copyErr) => {
        if (copyErr) throw copyErr;
        return resolve();
      });
    });
  }

  async install() {
    const { copyBeforeInstall, copyAfterInstall } = this.plugin.settings;

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
      console.log(await this.run(this.plugin.settings.customInstallationCommand));
    } else {
      const commands = this.plugin.runtimes.getCommands();
      console.log(await this.run(commands[this.plugin.settings.packageManager]));
    }

    for (const index in copyAfterInstall) {
      const pathTo = copyAfterInstall[index].to;
      const pathFrom = copyAfterInstall[index].from;

      const [from] = await resolveFile(path.join(this.layersPackageDir, pathFrom));
      const to = path.join(this.layersPackageDir, pathTo);

      try {
        await fsExtra.copy(from, to);
      } catch (e) {
        console.log(e);
      }
    }
  }
}

module.exports = Dependencies;
