const AbstractService = require('../AbstractService');

class LayersService extends AbstractService {

  descriptionWithChecksum (checksum) {
    return 'created by serverless-layers plugin (' + checksum + ')'
  }
  async publishVersion (checksum) {
    const params = {
      Content: {
        S3Bucket: this.bucketName,
        S3Key: this.zipFileKeyName
      },
      LayerName: this.layerName,
      Description: this.descriptionWithChecksum(checksum),

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

  async findVersionChecksumInList (checksum, marker) {
    const params = {
      LayerName: this.layerName,
      CompatibleRuntimes: this.plugin.settings.compatibleRuntimes,
      CompatibleArchitectures: this.plugin.settings.compatibleArchitectures
    };

    if (Marker) {
      params.Marker = marker;
    }

    const result = await this.awsRequest('Lambda:listLayerVersions', params, { checkError: true });
    this.plugin.log('Layers returned...');
    console.log(result);

    const description = this.descriptionWithChecksum(checksum);

    const matchingLayerVersion = result.LayerVersions.find((layer) => layer.Description === description);
    if (matchingLayerVersion) {
      return matchingLayerVersion.LayerVersionArn;
    } else if (result.NextMarker) {
      return this.findVersionChecksumInList(checksum, result.NextMarker);
    } else {
      return null;
    }
  }

  async checkLayersForChecksum (checksum) {
    this.plugin.log('Looking for version with...', checksum);
    const layerVersionArn = await this.findVersionChecksumInList(checksum, marker);

    if (layerVersionArn) {
      const params = { arn: layerVersionArn }
      const matchingLayerWithContent = await this.awsRequest('Lambda:getLayerVersionByArn', params, { checkError: true });
      if (matchingLayerWithContent) {
        this.plugin.log('Matching layer found...', matchingLayerWithContent.Content.CodeSha256);
        return matchingLayerWithContent.LayerVersionArn;
      }
    }
  }

  async cleanUpLayers (retainVersions = 0) {
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

  selectVersionsToDelete (versions, retainVersions) {
    return versions
      .sort((a, b) => parseInt(a.Version) === parseInt(b.Version) ? 0 : parseInt(a.Version) > parseInt(b.Version) ? -1 : 1)
      .slice(retainVersions);
  }
}

module.exports = LayersService;
