const path = require('path');

class AbstractService {
  constructor(plugin) {
    this.plugin = plugin;

    this.functionName = plugin.currentLayerName;
    this.stackName = plugin.getStackName();
    this.layerName = plugin.getLayerName();
    this.bucketName = plugin.getBucketName();
    this.provider = this.plugin.provider;

    this.dependenceFilename = path.join(plugin.getBucketLayersPath(), this.plugin.settings.dependenciesPath);
    this.zipFileKeyName = `${path.join(this.plugin.getBucketLayersPath(), this.layerName)}.zip`;

    if (/^win/.test(process.platform)) {
      this.zipFileKeyName = this.zipFileKeyName.replace(/\\/g, '/');
      this.dependenceFilename = this.dependenceFilename.replace(/\\/g, '/');
    }
  }

  getLayerPackageDir() {
    const { compileDir, runtimeDir } = this.plugin.settings;
    return path.join(process.cwd(), compileDir, 'layers', runtimeDir);;
  }
}

module.exports = AbstractService
