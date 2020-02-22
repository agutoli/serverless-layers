const path = require('path');

class AbstractService {
  constructor(plugin) {
    this.plugin = plugin;

    const { runtimeDir } = this.plugin.settings;

    this.stackName = plugin.getStackName();
    this.layerName = plugin.getStackName() + `-${runtimeDir}`;
    this.bucketName = plugin.getBucketName();
    this.provider = this.plugin.provider;

    this.dependenceFilename = path.join(plugin.getBucketLayersPath(), this.plugin.settings.dependenciesPath);
    this.zipFileKeyName = `${path.join(this.plugin.getBucketLayersPath(), this.stackName)}.zip`;

    if (/^win/.test(process.platform)) {
      this.zipFileKeyName = this.zipFileKeyName.replace(/\\/g, '/');
      this.dependenceFilename = this.dependenceFilename.replace(/\\/g, '/');
    }
  }
}

module.exports = AbstractService
