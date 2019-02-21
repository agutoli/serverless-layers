const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const MAX_LAYER_MB_SIZE = 250;

const AbstractService = require('../AbstractService');

class ZipService extends AbstractService {
  package() {
    const zipFileName = this.plugin.getPathZipFileName();
    const layersDir = path.join(process.cwd(), this.plugin.settings.compileDir);

    return new Promise((resolve, reject) => {
      const oldCwd = process.cwd();
      const output = fs.createWriteStream(zipFileName);
      const zip = archiver.create('zip');

      output.on('close', () => {
        const MB = (zip.pointer() / 1024 / 1024).toFixed(1);

        if (MB > MAX_LAYER_MB_SIZE) {
          this.plugin.log('Package error!');
          throw new Error(
            'Layers can\'t exceed the unzipped deployment package size limit of 250 MB! \n'
          + 'Read more: https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html\n\n'
          );
        }

        this.plugin.log(`Created layer package ${zipFileName} (${MB} MB)`);
        resolve();
      });

      zip.on('error', (err) => {
        reject(err);
        process.chdir(oldCwd);
      });

      process.chdir(layersDir);

      zip.pipe(output);

      zip.directory('layers', false);

      zip.finalize()
        .then(() => {
          process.chdir(oldCwd);
        });
    });
  }
}

module.exports = ZipService;
