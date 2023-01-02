const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
const fsExtra = require('fs-extra');
const archiver = require('archiver');

const MAX_LAYER_MB_SIZE = 250;

const AbstractService = require('../AbstractService');

class ZipService extends AbstractService {
  getManifestName(hashName) {
    return `__meta__/manifest-zip-artifact__${this.functionName}.json`;
  }

  getChecksum(path) {
    return new Promise(function (resolve, reject) {
      const hash = crypto.createHash('md5');
      const input = fs.createReadStream(path);

      input.on('error', reject);

      input.on('data', function (chunk) {
        hash.update(chunk);
      });

      input.on('close', function () {
        resolve(hash.digest('hex'));
      });
    });
  }

  async hasZipChanged() {
    const { artifact } = this.plugin.settings;
    const mName = this.getManifestName(artifact);

    const currentChecksum = await this.getChecksum(artifact);
    const remoteChecksum = await this.plugin.bucketService.getFile(mName);

    // check if zip hash changed
    if (remoteChecksum === currentChecksum) {
      return false;
    }

    // It updates remote check sum
    this.plugin.log(`${chalk.inverse.yellow(' Artifact changed ')}! Checksum=${currentChecksum}`);
    await this.plugin.bucketService.putFile(mName, currentChecksum);

    return true;
  }

  package(zipFileName = this.plugin.getPathZipFileName()) {
    const { compileDir, artifact, libraryFolder, runtimeDir } = this.plugin.settings;
    const layersDir = path.join(process.cwd(), compileDir);
    const shouldZipExternalLibraries = this.plugin.slsLayersConfig.shouldNotInstallPackages;
    const externalLibrariesFolder = path.join(process.cwd(), libraryFolder);

    return new Promise((resolve, reject) => {
      // it's a zip already
      if (artifact) {
        // It checks if file exists
        if (!fs.existsSync(zipFileName)) {
          throw Error(`Artifact not found "${zipFileName}".`);
        }
        return resolve();
      }

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

      if (shouldZipExternalLibraries) {
        console.log(`[ LayersPlugin ]: external libraries should be zipped, externalLibrariesFolder - ${externalLibrariesFolder}, runtimeDir - ${runtimeDir}, ${libraryFolder}`);
        zip.directory(externalLibrariesFolder, path.join(runtimeDir, libraryFolder));
      }

      zip.finalize()
        .then(() => {
          process.chdir(oldCwd);
        });
    });
  }
}

module.exports = ZipService;
