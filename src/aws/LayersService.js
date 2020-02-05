const AbstractService = require('../AbstractService');

class LayersService extends AbstractService {
  async publishVersion() {
    const params = {
      Content: {
        S3Bucket: this.bucketName,
        S3Key: this.zipFileKeyName
      },
      LayerName: this.stackName,
      Description: 'created by serverless-layers plugin',
      CompatibleRuntimes: this.plugin.settings.compatibleRuntimes
    };

    return this.provider.request('Lambda', 'publishLayerVersion', params)
      .then((result) => {
        this.plugin.log('New layer version published...');
        this.plugin.cacheObject.LayerVersionArn = result.LayerVersionArn;
        return result;
      })
      .catch(e => {
        console.log(e.message);
        process.exit(1);
      });
  }

  async cleanUpLayers() {
    const params = {
      LayerName: this.stackName
    };

    const response = await this.provider.request('Lambda', 'listLayerVersions', params);

    if (response.LayerVersions.length === 0) {
      this.plugin.log('Layers removal finished.');
      return;
    }

    const deleteQueue = response.LayerVersions.map((layerVersion) => {
      this.plugin.log(`Removing layer version: ${layerVersion.Version}`);
      return this.provider.request('Lambda', 'deleteLayerVersion', {
        LayerName: this.stackName,
        VersionNumber: layerVersion.Version
      });
    });

    await Promise.all(deleteQueue);

    await this.cleanUpLayers();
  }
}

module.exports = LayersService;
