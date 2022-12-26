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

    return this.awsRequest('Lambda:publishLayerVersion', params, { checkError: true })
      .then((result) => {
        this.plugin.log('New layer version published...');
        this.plugin.cacheObject.LayerVersionArn = result.LayerVersionArn;
        return result;
      });
  }

  async cleanUpLayers(retainVersions = 0) {
    const params = {
      LayerName: this.layerName
    };

    const response = await this.awsRequest('Lambda:listLayerVersions', params, { checkError: true });

    if (response.LayerVersions.length <= retainVersions) {
      this.plugin.log('Layers removal finished.\n');
      return;
    }

    if (this.plugin.settings.retainVersions) {
      const deletionCandidates = this.selectVersionsToDelete(response.LayerVersions, retainVersions);

      const deleteQueue = deletionCandidates.map((layerVersion) => {
        this.plugin.log(`Removing layer version: ${layerVersion.Version}`);
        return this.awsRequest('Lambda:deleteLayerVersion', {
          LayerName: this.layerName,
          VersionNumber: layerVersion.Version
        }, { checkError: true });
      });

      await Promise.all(deleteQueue);

      await this.cleanUpLayers(retainVersions);
    }
  }

  selectVersionsToDelete(versions, retainVersions) {
    return versions
      .sort((a, b) => parseInt(a.Version) === parseInt(b.Version) ? 0 : parseInt(a.Version) > parseInt(b.Version) ? -1 : 1)
      .slice(retainVersions);
  }
}

module.exports = LayersService;
