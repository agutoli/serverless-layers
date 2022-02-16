const AbstractService = require('../AbstractService');

class LayersService extends AbstractService {
  async publishVersion() {
    const params = {
      Content: {
        S3Bucket: this.bucketName,
        S3Key: this.zipFileKeyName
      },
      LayerName: this.layerName,
      Description: 'created by serverless-layers plugin',
      CompatibleRuntimes: this.plugin.settings.compatibleRuntimes,
      CompatibleArchitectures: this.plugin.settings.compatibleArchitectures
    };
    console.log({ params });

    return this.awsRequest('Lambda:publishLayerVersion', params, { checkError: true })
      .then((result) => {
        this.plugin.log('New layer version published...');
        this.plugin.cacheObject.LayerVersionArn = result.LayerVersionArn;
        return result;
      });
  }

  async cleanUpLayers() {
    const params = {
      LayerName: this.layerName
    };

    const response = await this.awsRequest('Lambda:listLayerVersions', params, { checkError: true });

    if (response.LayerVersions.length === 0) {
      this.plugin.log('Layers removal finished.');
      return;
    }

    const deleteQueue = response.LayerVersions.map((layerVersion) => {
      this.plugin.log(`Removing layer version: ${layerVersion.Version}`);
      return this.awsRequest('Lambda:deleteLayerVersion', {
        LayerName: this.layerName,
        VersionNumber: layerVersion.Version
      }, { checkError: true });
    });

    await Promise.all(deleteQueue);

    await this.cleanUpLayers();
  }
}

module.exports = LayersService;
