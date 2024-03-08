const fs = require('fs');
const chalk = require('chalk');
const fsExtra = require('fs-extra');
const glob = require('glob');
const path = require('path');
const mkdirp = require('mkdirp');
const { execSync } = require('child_process');
const copyFile = require('fs-copy-file'); // node v6.10.3 support

const AbstractService = require('../AbstractService');

function resolveFile(from, opts = {}) {
  return new Promise((resolve, reject) => {
    glob(from, opts, (err, files) => {
      if (err) return reject();
      return resolve(files);
    });
  });
}

class Dependencies extends AbstractService {
  init() {
    this.layersPackageDir = this.getLayerPackageDir();
    fs.rmSync(this.layersPackageDir, {force: true, recursive: true});
    return mkdirp.sync(this.layersPackageDir);
  }

  getDepsPath() {
    const { settings } = this.plugin;
    const rooPath = path.join(settings.path, settings.dependenciesPath);

    return path.resolve(rooPath);
  }

  /**
   * Implementing package pattern ignore
   * https://github.com/agutoli/serverless-layers/issues/118
   */
  async excludePatternFiles() {
    let filesToIgnore = [];
    let filesToExclude = [];

    /**
     * Patterns allows you to define globs that will be excluded / included from the
     * resulting artifact. If you wish to exclude files you can use a glob pattern prefixed
     * with ! such as !exclude-me/**. Serverless will run the glob patterns in order so
     * you can always re-include previously excluded files and directories.
     *
     * Reference: https://www.serverless.com/framework/docs/providers/aws/guide/packaging
     */
    for (let pattern of this.plugin.settings.layerOptimization.cleanupPatterns) {
      if (pattern.startsWith('!')) {
        const resolvedFiles = await resolveFile(pattern.substr(1), {
          cwd: this.layersPackageDir
        });
        filesToIgnore = filesToIgnore.concat(resolvedFiles);
      } else {
        // change directory
        const resolvedFiles = await resolveFile(pattern, {
          cwd: this.layersPackageDir
        });
        filesToExclude = filesToExclude.concat(resolvedFiles);
      }
    }

    filesToExclude.forEach((filename) => {
      // check if folder or files are being ignored, and shouldn't be removed.
      const shouldBeIgnored = filesToIgnore.filter(x => x.startsWith(filename)).length > 0;

      if (!shouldBeIgnored) {
        this.plugin.warn(`[layerOptimization.cleanupPatterns] Ignored: ${filename}`);
        fs.rmSync(path.join(this.layersPackageDir, filename), {force: true, recursive: true});
      }
    });
  }

  async run(cmd) {
    const output = execSync(cmd, {
      cwd: this.layersPackageDir,
      env: process.env,
      maxBuffer: 1024 * 1024 * 500
    }).toString();
    return output;
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
      const {packageManagerExtraArgs, packageManager} = this.plugin.settings;
      const installCommand = `${commands[packageManager]} ${packageManagerExtraArgs}`;
      this.plugin.log(chalk.white.bold(installCommand));
      console.log(chalk.white(await this.run(installCommand)));
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

    // cleanup files
    try {
      await this.excludePatternFiles();
    } catch(err) {
      if (!this.plugin.service.package.patterns) {
        this.plugin.warn(`[warning] package.patterns option is not set. @see https://www.serverless.com/framework/docs/providers/aws/guide/packaging`);
      } else {
        console.error(err);
        process.exit(1);
      }
    }
  }
}

module.exports = Dependencies;
