export class ServerlessLayersConfig {
  constructor(options) {
    this.shouldNotInstallPackages = (options.shouldNotInstallPackages === 'true');

    this.shouldUseLayersArtifactory = (options.shouldUseLayersArtifactory === 'true');
    this.artifactoryBucketName = options.artifactoryBucketName;
    this.artifactoryRegion = options.artifactoryRegion;

    this.s3ArtifactoryAccessKeyId = process.env.SLS_CODE_ARTIFACTS_AWS_ACCESS_KEY_ID;
    this.s3ArtifactorySecretAccessKey = process.env.SLS_CODE_ARTIFACTS_AWS_SECRET_ACCESS_KEY;
    this.s3ArtifactorySessionToken = process.env.SLS_CODE_ARTIFACTS_AWS_SESSION_TOKEN;

    this.artifactoryHashKey = options.artifactoryHashKey;

    this.organizationId = options.organizationId;
    this.uniqueTag = options.tag;
    this.artifactoryStr = options.artifactoryStr ? options.artifactoryStr : 'artifactory';
  }

  init(plugin) {
    const pluginLayerName = plugin.getLayerName();
    this.artifactoryLayerName = pluginLayerName.includes(this.uniqueTag) ? pluginLayerName.replace(this.uniqueTag, this.artifactoryStr) : `${pluginLayerName}-${this.artifactoryStr}`;
    this.artifactoryJsonMappingKey = `${this.artifactoryLayerName}/${this.artifactoryHashKey}.json`;
    this.artifactoryZipKey = `${this.artifactoryLayerName}/${this.artifactoryLayerName}.zip`;
    this.tempArtifactoryZipFileName = `${this.artifactoryLayerName}.zip`;
  }

}
