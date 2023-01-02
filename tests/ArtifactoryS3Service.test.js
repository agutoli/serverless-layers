const { expect } = require('chai');
const sinon = require('sinon');
const { ArtifactoryS3BucketService } = require('../lib/artifactory/ArtifactoryS3BucketService');

describe('ArtifactoryS3Service Tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  const artifactoryS3Service = new ArtifactoryS3BucketService({
    artifactoryBucketName: 'bucket-name-test',
    artifactoryJsonMappingKey: 'hash.json'

  });

  const stubS3ClientWithReturnValue = (returnValue) => {
    sinon.stub(artifactoryS3Service, 's3Client').value({
      getObject: () => {
        return {
          promise: () => {
            return {
              Body: {
                toString: returnValue
              }
            };
          }
        };
      },
      config: {
        region: 'us-east-2',
        endpoint: 's3-endpoint'
      }
    });
  };

  it('when file is found in s3 bucket', async () => {
    stubS3ClientWithReturnValue(() => {
      return JSON.stringify({
        layerInfo: {
          layerArn: 'layer-arn-test'
        }
      });
    });
    const layerArn = await artifactoryS3Service.downloadLayerHashMappingJsonFile();

    expect(layerArn).equals('layer-arn-test');
  });

  it('when file is not found in s3 bucket - expect to return undefined', async () => {
    stubS3ClientWithReturnValue(() => {
      const noSuckKeyError = new Error();
      noSuckKeyError.code = 'NoSuchKey';
      throw noSuckKeyError;
    });
    const layerArn = await artifactoryS3Service.downloadLayerHashMappingJsonFile();

    expect(layerArn).undefined;
  });

  it('when s3 client throws exception - expect function to fail and throw exception', async () => {
    stubS3ClientWithReturnValue(() => {
      throw new Error('error in s3');
    });
    try {
      await artifactoryS3Service.downloadLayerHashMappingJsonFile();
    } catch (e) {
      expect(e.message).equals('error in s3');
    }
  });
});
