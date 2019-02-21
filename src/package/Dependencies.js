const path = require('path');
const mkdirp = require('mkdirp');
const install = require('npm-install-package');
const copyFile = require('fs-copy-file'); // v6.10.3 support

const AbstractService = require('../AbstractService');

class Dependencies extends AbstractService {
  async install() {
    this.plugin.log('Dependencies has changed! Re-installing...');

    const initialCwd = process.cwd();
    const nodeJsDir = path.join(process.cwd(), this.plugin.settings.compileDir, 'layers', 'nodejs');

    await mkdirp.sync(nodeJsDir);

    return new Promise((resolve) => {
      copyFile(this.plugin.settings.packagePath, path.join(nodeJsDir, 'package.json'), (copyErr) => {
        if (copyErr) throw copyErr;

        // install deps
        process.chdir(nodeJsDir);

        const opts = { saveDev: false, cache: true, silent: false };

        install(this.plugin.getDependenciesList(), opts, (installErr) => {
          process.chdir(initialCwd);
          if (installErr) throw installErr;
          resolve();
        });
      });
    });
  }
}

module.exports = Dependencies;
