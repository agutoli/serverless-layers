const path = require('path');

class AbstractService {
  constructor(plugin) {
    this.plugin = plugin;

    this.stackName = plugin.getStackName();
    this.bucketName = plugin.getBucketName();
    this.provider = this.plugin.provider;
    this.packageJsonKeyName = path.join(plugin.getBucketLayersPath(), 'package.json');
    this.zipFileKeyName = `${path.join(this.plugin.getBucketLayersPath(), this.stackName)}.zip`;
  }
}

module.exports = AbstractService
