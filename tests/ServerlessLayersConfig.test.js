const { expect } = require('chai');

const { ServerlessLayersConfig } = require('../lib/config/ServerlessLayersConfig');
const ServerlessLayers = require('../lib/index');

describe('ServerlessLayersConfig Tests', () => {
  it('when options do not include any config', () => {
    const serverlessLayerConfig = new ServerlessLayersConfig({});
    expect(serverlessLayerConfig.shouldNotInstallPackages).to.false;
    expect(serverlessLayerConfig.shouldUseLayersArtifactory).to.false;
    expect(serverlessLayerConfig.artifactoryRegion).undefined;
    expect(serverlessLayerConfig.s3ArtifactoryAccessKeyId).undefined;
    expect(serverlessLayerConfig.s3ArtifactorySecretAccessKey).undefined;
    expect(serverlessLayerConfig.s3ArtifactorySessionToken).undefined;
    expect(serverlessLayerConfig.uniqueTag).undefined;
    expect(serverlessLayerConfig.artifactoryStr).equals('artifactory');
    expect(serverlessLayerConfig.artifactoryHashKey).undefined;
    expect(serverlessLayerConfig.organizationId).undefined;
    expect(serverlessLayerConfig.artifactoryLayerName).undefined;
    expect(serverlessLayerConfig.artifactoryJsonMappingKey).undefined;
    expect(serverlessLayerConfig.artifactoryZipKey).undefined;
    expect(serverlessLayerConfig.tempArtifactoryZipFileName).undefined;
  });

  it('when options include config', () => {
    process.env.SLS_CODE_ARTIFACTS_AWS_ACCESS_KEY_ID = 'test_access_key';
    process.env.SLS_CODE_ARTIFACTS_AWS_SECRET_ACCESS_KEY = 'test_secret_key';
    process.env.SLS_CODE_ARTIFACTS_AWS_SESSION_TOKEN = 'test_session_token';
    const serverlessLayerConfig = new ServerlessLayersConfig({
      shouldNotInstallPackages: 'false',
      shouldUseLayersArtifactory: 'false',
      artifactoryRegion: 'us-west-2',
      artifactoryLayerName: 'artifactory-layer-test',
      artifactoryHashKey: 'hash-key-test',
      organizationId: 'organization-id-test',
      tag: 'test',
      artifactoryStr: 'artifactory-test'
    });

    expect(serverlessLayerConfig.shouldNotInstallPackages).to.false;
    expect(serverlessLayerConfig.shouldUseLayersArtifactory).to.false;
    expect(serverlessLayerConfig.artifactoryRegion).equals('us-west-2');
    expect(serverlessLayerConfig.s3ArtifactoryAccessKeyId).equals('test_access_key');
    expect(serverlessLayerConfig.s3ArtifactorySecretAccessKey).equals('test_secret_key');
    expect(serverlessLayerConfig.s3ArtifactorySessionToken).equals('test_session_token');
    expect(serverlessLayerConfig.uniqueTag).equals('test');
    expect(serverlessLayerConfig.artifactoryStr).equals('artifactory-test');
    expect(serverlessLayerConfig.artifactoryHashKey).equals('hash-key-test');
    expect(serverlessLayerConfig.organizationId).equals('organization-id-test');
    expect(serverlessLayerConfig.artifactoryLayerName).undefined;
    expect(serverlessLayerConfig.artifactoryJsonMappingKey).undefined;
    expect(serverlessLayerConfig.artifactoryZipKey).undefined;
    expect(serverlessLayerConfig.tempArtifactoryZipFileName).undefined;

    process.env.SLS_CODE_ARTIFACTS_AWS_ACCESS_KEY_ID = undefined;
    process.env.SLS_CODE_ARTIFACTS_AWS_SECRET_ACCESS_KEY = undefined;
    process.env.SLS_CODE_ARTIFACTS_AWS_SESSION_TOKEN = undefined;
  });

  it('when shouldNotInstallPackages and shouldUseLayersArtifactory should be true', () => {
    const serverlessLayerConfig = new ServerlessLayersConfig({
      shouldNotInstallPackages: 'true',
      shouldUseLayersArtifactory: 'true',
    });

    expect(serverlessLayerConfig.shouldNotInstallPackages).to.true;
    expect(serverlessLayerConfig.shouldUseLayersArtifactory).to.true;
  });

  it('test init function for file names fields when stack name contains unique tag', () => {
    const serverlessLayerConfig = new ServerlessLayersConfig({
      artifactoryLayerName: 'artifactory-layer-test',
      artifactoryHashKey: 'hash-key-test',
      tag: 'unique-tag'
    });
    const plugin = new ServerlessLayers({}, {});
    plugin.settings = {
      runtimeDir: 'nodejs',
    };
    plugin.currentLayerName = 'common';
    plugin.provider = {
      naming: {
        getStackName: () => 'layer-test-unique-tag-stack'
      }
    };

    serverlessLayerConfig.init(plugin);
    expect(serverlessLayerConfig.artifactoryLayerName).equals('layer-test-artifactory-stack-nodejs-common');
    expect(serverlessLayerConfig.artifactoryJsonMappingKey).equals('layer-test-artifactory-stack-nodejs-common/hash-key-test.json');
    expect(serverlessLayerConfig.artifactoryZipKey).equals('layer-test-artifactory-stack-nodejs-common/layer-test-artifactory-stack-nodejs-common.zip');
    expect(serverlessLayerConfig.tempArtifactoryZipFileName).equals('layer-test-artifactory-stack-nodejs-common.zip');
  });

  it('test init function for file names fields when stack name does not contain unique tag', () => {
    const serverlessLayerConfig = new ServerlessLayersConfig({
      artifactoryLayerName: 'artifactory-layer-test',
      artifactoryHashKey: 'hash-key-test',
      tag: 'some-tag'
    });
    const plugin = new ServerlessLayers({}, {});
    plugin.settings = {
      runtimeDir: 'nodejs',
    };
    plugin.currentLayerName = 'common';
    plugin.provider = {
      naming: {
        getStackName: () => 'layer-test-unique-tag-stack'
      }
    };

    serverlessLayerConfig.init(plugin);
    expect(serverlessLayerConfig.artifactoryLayerName).equals('layer-test-unique-tag-stack-nodejs-common-artifactory');
    expect(serverlessLayerConfig.artifactoryJsonMappingKey).equals('layer-test-unique-tag-stack-nodejs-common-artifactory/hash-key-test.json');
    expect(serverlessLayerConfig.artifactoryZipKey).equals('layer-test-unique-tag-stack-nodejs-common-artifactory/layer-test-unique-tag-stack-nodejs-common-artifactory.zip');
    expect(serverlessLayerConfig.tempArtifactoryZipFileName).equals('layer-test-unique-tag-stack-nodejs-common-artifactory.zip');
  });
});
