const { ArtifactoryS3BucketService } = require('./ArtifactoryS3BucketService');
const { ArtifactoryLayerService } = require('./ArtifactoryLayerService');

export class ArtifactoryService {

  constructor(serverlessLayersConfig, zipService, plugin) {
    this.artifactoryS3BucketService = new ArtifactoryS3BucketService(serverlessLayersConfig);
    this.artifactoryLayerService = new ArtifactoryLayerService(serverlessLayersConfig, plugin.settings.compatibleRuntimes);
    this.tempArtifactoryZipFileName = serverlessLayersConfig.tempArtifactoryZipFileName;
    this.zipService = zipService;
  }

  initServices() {
    this.artifactoryS3BucketService.initService();
    this.artifactoryLayerService.initService();
  }

  async updateLayerFromArtifactory() {
    console.log('[ LayersPlugin - Artifacts ]: going to update layer using artifactory');
    this.initServices();

    let layerVersionArn = await this.artifactoryS3BucketService.downloadLayerHashMappingJsonFile();

    if (!layerVersionArn) {
      console.log('[ LayersPlugin - Artifacts ]: hash does not exist in the artifactory, going to add new layer');
      await this.zipService.package(this.tempArtifactoryZipFileName);
      await this.artifactoryS3BucketService.uploadLayerZipFile();
      layerVersionArn = await this.artifactoryLayerService.publishLayerFromArtifactory();
      await this.artifactoryS3BucketService.uploadLayerHashMappingFile(layerVersionArn);
    }

    return layerVersionArn;
  }
}
