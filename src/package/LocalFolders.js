const path = require('path');
const fsExtra = require('fs-extra');
const mkdirp = require('mkdirp');
const { hashElement } = require('folder-hash');

const AbstractService = require('../AbstractService');

class LocalFolders extends AbstractService {
  init() {
    this.layersPackageDir = this.getLayerPackageDir();
    return mkdirp.sync(this.layersPackageDir);
  }

  getManifestName(hashName) {
    return `__meta__/manifest-localdir-${hashName.toLowerCase()}.json`;
  }

  async getHash() {
    const { settings } = this.plugin;

    if (!settings.localDir) {
      return;
    }

    const options = {
      folders: settings.localDir.folders,
      files: settings.localDir.files
    };

    return hashElement(settings.localDir.path, options);
  }

  async hasFoldersChanged() {
    return this.getHash().then((hash) => {
      const manifest = this.getManifestName(hash.name);
      return this.plugin.bucketService.getFile(manifest).then(remoteManifest => {
        if (remoteManifest === JSON.stringify(hash)) {
          // not changed
          return false;
        }
        return true;
      });
    });
  }

  async copyFolders() {
    const { settings } = this.plugin;

    if (!settings.localDir) {
      return;
    }

    await this.getHash()
      .then((hash) => {
        const manifest = this.getManifestName(hash.name);
        const to = path.join(this.layersPackageDir, settings.libraryFolder, settings.localDir.name);
        const from = path.resolve(settings.localDir.path);

        return fsExtra.copy(from, to).then(() => {
          return this.plugin.bucketService.putFile(manifest, JSON.stringify(hash));
        });
      });
  }
}

module.exports = LocalFolders;
