const { expect } = require('chai');
const sinon = require('sinon');

const ServerlessLayers = require('../lib/index');

describe('ServerlessLayers Tests', () => {
  describe('test main() function when deployLayers()', () => {
    let plugin;

    const stubPlugin = (hasCustomHashChanged) => {
      plugin.settings = {
        runtimeDir: 'nodejs',
        dependenciesLockPath: 'package-lock.json',
        customHash: 'cutsomHash'
      };

      plugin.currentLayerName = 'common';

      plugin.runtimes = {
        init: async () => Promise.resolve()
      };
      plugin.dependencies = {
        init: async () => Promise.resolve(),
        getDepsPath: () => 'test-path'
      };
      plugin.localFolders = {
        init: async () => Promise.resolve()
      };

      plugin.provider = {
        naming: {
          getStackName: () => 'test-stack-name'
        }
      };

      sinon.stub(plugin, 'hasSettingsChanges').callsFake(() => {
        return false;
      });

      sinon.stub(plugin, 'hasCustomHashChanged').callsFake(() => {
        return hasCustomHashChanged;
      });

      sinon.stub(plugin, 'mergePackageOptions').callsFake(() => {
      });

      sinon.stub(plugin, 'getLayerArn').callsFake(() => {
        return false;
      });

      plugin.zipService = {
        package: () => {}
      };

      plugin.bucketService = {
        uploadZipFile: () => {},
        putFile: () => {}
      };

      plugin.layersService = {
        publishVersion: () => {
          return { LayerVersionArn: 'test-layer-version-arn' };
        }
      };

      plugin.artifactoryLayerService = {
        updateLayerFromArtifactory: () => 'test-version-arn-artifactory'
      };
    };

    afterEach(() => {
      sinon.restore();
    });

    it('when no changes and not skip installation and no use artifactory - expect package zip, upload file to bucket, publish version and relate layer with functions', async () => {
      plugin = new ServerlessLayers({}, {
        shouldUseLayersArtifactory: 'false'
      });

      stubPlugin(false);

      const zipPackageSpy = sinon.spy(plugin.zipService, 'package');
      const bucketServiceUploadZipFileSpy = sinon.spy(plugin.bucketService, 'uploadZipFile');
      const layersServicePublishVersionSpy = sinon.spy(plugin.layersService, 'publishVersion');
      const bucketServicePutFileSpy = sinon.spy(plugin.bucketService, 'putFile');
      const relateLayerWithFunctionsSpy = sinon.stub(plugin, 'relateLayerWithFunctions').callsFake(() => {});
      const artifactoryLayerServiceSpy = sinon.spy(plugin.artifactoryLayerService, 'updateLayerFromArtifactory');

      await plugin.main();

      sinon.assert.calledOnce(zipPackageSpy);
      sinon.assert.calledOnce(bucketServiceUploadZipFileSpy);
      sinon.assert.calledOnce(layersServicePublishVersionSpy);
      sinon.assert.calledWith(bucketServicePutFileSpy, 'test-path');
      sinon.assert.calledWith(bucketServicePutFileSpy, 'package-lock.json');
      sinon.assert.notCalled(artifactoryLayerServiceSpy);

      expect(bucketServicePutFileSpy.calledWith('customHash.json', JSON.stringify({ hash: 'customHash' }))).not.to.be.true;

      sinon.assert.calledWith(relateLayerWithFunctionsSpy, 'test-layer-version-arn', 'test-stack-name-nodejs-common');
    });

    it('when no changes and not skip installation and no use artifactory - expect using artifactory service', async () => {
      plugin = new ServerlessLayers({}, {
        shouldUseLayersArtifactory: 'true'
      });

      plugin.slsLayersConfig.artifactoryLayerName = 'artifactory-layer';

      stubPlugin(false);

      const zipPackageSpy = sinon.spy(plugin.zipService, 'package');
      const bucketServiceUploadZipFileSpy = sinon.spy(plugin.bucketService, 'uploadZipFile');
      const layersServicePublishVersionSpy = sinon.spy(plugin.layersService, 'publishVersion');
      const bucketServicePutFileSpy = sinon.spy(plugin.bucketService, 'putFile');
      const relateLayerWithFunctionsSpy = sinon.stub(plugin, 'relateLayerWithFunctions').callsFake(() => {});
      const artifactoryLayerServiceSpy = sinon.spy(plugin.artifactoryLayerService, 'updateLayerFromArtifactory');

      await plugin.main();

      sinon.assert.notCalled(zipPackageSpy);
      sinon.assert.notCalled(bucketServiceUploadZipFileSpy);
      sinon.assert.notCalled(layersServicePublishVersionSpy);

      sinon.assert.calledWith(bucketServicePutFileSpy, 'test-path');
      sinon.assert.calledWith(bucketServicePutFileSpy, 'package-lock.json');

      sinon.assert.calledOnce(artifactoryLayerServiceSpy);

      expect(bucketServicePutFileSpy.calledWith('customHash.json', JSON.stringify({ hash: 'customHash' }))).not.to.be.true;

      sinon.assert.calledWith(relateLayerWithFunctionsSpy, 'test-version-arn-artifactory', 'artifactory-layer');
    });
  });
});
