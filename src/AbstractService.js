const chalk = require('chalk');
const path = require('path');

class AbstractService {
  constructor(plugin) {
    this.plugin = plugin;

    this.functionName = plugin.currentLayerName;
    this.stackName = plugin.getStackName();
    this.layerName = plugin.getLayerName();
    this.bucketName = plugin.getBucketName();
    this.bucketEncryption = plugin.getBucketEncryptiom();
    this.provider = this.plugin.provider;

    this.dependenceFilename = path.join(plugin.getBucketLayersPath(), this.plugin.settings.dependenciesPath);
    this.zipFileKeyName = `${path.join(this.plugin.getBucketLayersPath(), this.layerName)}.zip`;

    if (/^win/.test(process.platform)) {
      this.zipFileKeyName = this.zipFileKeyName.replace(/\\/g, '/');
      this.dependenceFilename = this.dependenceFilename.replace(/\\/g, '/');
    }
  }

  async awsRequest(serviceAction, params, opts={}) {
    const [service, action] = serviceAction.split(':');
    if (!opts.checkError) {
      return this.provider.request(service, action, params);
    }

    try {
      const resp = await this.provider.request(service, action, params);
      return resp;
    }catch(e) {
      console.log(chalk.red(`ServerlessLayers error:`));
      console.log(`    Action: ${serviceAction}`);
      console.log(`    Params: ${JSON.stringify(params)}`);
      console.log(chalk.red(`AWS SDK error:`));
      console.log(`    ${e.message}`);
      process.exit(1);
    }
  }

  getLayerPackageDir() {
    const { compileDir, runtimeDir } = this.plugin.settings;
    return path.join(process.cwd(), compileDir, 'layers', runtimeDir);;
  }
}

module.exports = AbstractService
