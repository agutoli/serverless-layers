const AbstractService = require('../AbstractService');

class LayersService extends AbstractService {

  descriptionWithVersionKey(versionKey) {
    return 'created by serverless-layers plugin (' + versionKey + ')'
  }

  async publishVersion(versionKey) {
    const params = {
      Content: {
        S3Bucket: this.bucketName,
        S3Key: this.zipFileKeyName
      },
      LayerName: this.layerName,
      Description: this.descriptionWithVersionKey(versionKey),

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


  async findVersionChecksumInList(versionKey, marker) {
    const params = {
      LayerName: this.layerName,
      // TODO: Question: is layer name specific enough?  Is there a way to deploy multiple runtime architectures per name?
      // CompatibleRuntime: this.plugin.settings.compatibleRuntimes,
      // CompatibleArchitecture: this.plugin.settings.compatibleArchitectures
    };

    if (marker) {
      params.Marker = marker;
    }

    const result = await this.awsRequest('Lambda:listLayerVersions', params, { checkError: true });

    const description = this.descriptionWithVersionKey(versionKey);

    const matchingLayerVersion = result.LayerVersions.find((layer) => layer.Description === description);
    if (matchingLayerVersion) {
      return matchingLayerVersion.LayerVersionArn;
    } else if (result.NextMarker) {
      return this.findVersionChecksumInList(versionKey, result.NextMarker);
    } else {
      return null;
    }
  }

  async checkLayersForVersionKey(versionKey) {
    this.plugin.log('Looking for version with "' + versionKey + '"');
    const layerVersionArn = await this.findVersionChecksumInList(versionKey);

    if (layerVersionArn) {
      return layerVersionArn;
      // TODO: double-check to confirm layer content is as expected
      //   const params = { arn: layerVersionArn }
      //   const matchingLayerWithContent = await this.awsRequest('Lambda:getLayerVersionByArn', params, { checkError: true });
      //   if (matchingLayerWithContent) {
      //      matchingLayerWithContent.Content.Location // A link to the layer archive in Amazon S3 that is valid for 10 minutes.
      //   }
    }
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
