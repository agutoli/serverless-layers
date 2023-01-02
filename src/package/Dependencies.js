const fs = require('fs');
const chalk = require('chalk');
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
    this.layersPackageDir = this.getLayerPackageDir();
    return mkdirp.sync(this.layersPackageDir);
  }

  getDepsPath() {
    const { settings } = this.plugin;
    const rooPath = path.join(settings.path, settings.dependenciesPath);

    return path.resolve(rooPath);
  }

  async run(cmd) {
    if (!this.plugin.slsLayersConfig.shouldNotInstallPackages) {
      console.log('[ LayersPlugin ]: installing packages');
      const output = execSync(cmd, {
        cwd: this.layersPackageDir,
        env: process.env,
        maxBuffer: 1024 * 1024 * 500
      }).toString();
      return output;
    }
  }

  copyProjectFile(filePath, fileName = null) {
    this.init();

    if (!fs.existsSync(filePath)) {
      this.plugin.warn(`[warning] "${filePath}" file does not exists!`);
      return true;
    }

    return new Promise((resolve) => {
      const destFile = path.join(this.layersPackageDir, fileName || path.basename(filePath));
      copyFile(filePath, destFile, (copyErr) => {
        if (copyErr) throw copyErr;
        return resolve();
      });
    });
  }

  async install() {
    const { copyBeforeInstall, copyAfterInstall } = this.plugin.settings;

    this.init();
    this.plugin.log(`${chalk.inverse.yellow(' Changes identified ')}! Re-installing...`);

    /**
     * This is necessary because npm is
     * not possible to specify a custom
     * name for package.json.
     */
    let renameFilename = null;
    if (this.plugin.settings.runtimeDir === 'nodejs') {
      renameFilename = 'package.json';
    }

    await this.copyProjectFile(this.getDepsPath(), renameFilename);

    for (const index in copyBeforeInstall) {
      const filename = copyBeforeInstall[index];
      await this.copyProjectFile(filename);
    }

    // custom commands
    if (this.plugin.settings.customInstallationCommand) {
      console.log(chalk.white(await this.run(this.plugin.settings.customInstallationCommand)));
    } else {
      const commands = this.plugin.runtimes.getCommands();
      console.log(chalk.white(await this.run(commands[this.plugin.settings.packageManager])));
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
