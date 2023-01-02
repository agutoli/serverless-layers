const { expect } = require('chai');
const sinon = require('sinon');
const { ArtifactoryService } = require('../lib/artifactory/ArtifactoryService');

describe('ArtifactoryService Tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('when file is found in s3 artifactory bucket and returns a version arn', async () => {
    const artifactoryService = new ArtifactoryService({}, {}, { settings: { compatibleRuntimes: [] } });
    sinon.stub(artifactoryService, 'initServices').callsFake(() => {
      artifactoryService.artifactoryS3BucketService = {
        downloadLayerHashMappingJsonFile: () => {
          return 'layer-version-arn-from-bucket';
        }
      };
    });

    const layerArn = await artifactoryService.updateLayerFromArtifactory();
    expect(layerArn).equals('layer-version-arn-from-bucket');
  });

  it('when file is not found in s3 artifactory bucket - expect to run the whole flow', async () => {
    const artifactoryService = new ArtifactoryService({}, {}, { settings: { compatibleRuntimes: [] } });
    sinon.stub(artifactoryService, 'zipService').value({
      package: () => Promise.resolve()
    });

    sinon.stub(artifactoryService, 'initServices').callsFake(() => {
      artifactoryService.artifactoryS3BucketService = {
        downloadLayerHashMappingJsonFile: () => undefined,
        uploadLayerZipFile: () => {},
        uploadLayerHashMappingFile: () => {}
      };
      artifactoryService.artifactoryLayerService = {
        publishLayerFromArtifactory: () => {
          return 'layer-version-arn-from-publish-layer';
        }
      };
    });

    const layerArn = await artifactoryService.updateLayerFromArtifactory();
    expect(layerArn).equals('layer-version-arn-from-publish-layer');
  });

  it('one of the internal services throws exception - expect flow to fail and throw exception', async () => {
    const artifactoryService = new ArtifactoryService({}, {}, { settings: { compatibleRuntimes: [] } });
    sinon.stub(artifactoryService, 'initServices').callsFake(() => {
      artifactoryService.artifactoryS3BucketService = {
        downloadLayerHashMappingJsonFile: () => {
          throw new Error('exception in artifactory flow');
        }
      };
    });

    try {
      await artifactoryService.updateLayerFromArtifactory();
    } catch (e) {
      expect(e.message).equals('exception in artifactory flow');
    }
  });
});
