const { expect } = require('chai');
const lodashSet = require('lodash.set')
const sinon = require('sinon');
const Runtime = require('runtimes');

const nodejsConfig = require('./fixtures/nodejsConfig')

describe('Runtime', () => {
  let plugin;
  let runtimes;
  describe('-> NodeJs', () => {
    beforeEach(() => {
      plugin = {
        log: sinon.mock(),
        error: sinon.mock(),
      };

      lodashSet(plugin, 'service.provider.runtime', 'nodejs12.x');

      runtimes = new Runtime(plugin);
    });

    it('should merge settings with new values', () => {
      expect(runtimes.getDefaultSettings({
        packageManager: 'yarn',
        dependenciesPath: './fixtures/package.json'
      })).to.deep.equal(nodejsConfig);
    })

    describe('-> hasDependencesChanged', () => {
      beforeEach(() => {
        const remoteDeps = JSON.stringify({
          dependencies: {
            express: '1.2.3'
          }
        })

        lodashSet(plugin, 'bucketService.downloadDependencesFile', () => Promise.resolve(remoteDeps));

        plugin.settings = runtimes.getDefaultSettings({
          packageManager: 'yarn',
          dependenciesPath: './tests/fixtures/package.json'
        })
        runtimes.init()
      });

      it('checks if version is compatible', () => {
        return runtimes._runtime.isCompatibleVersion('v12.16').then((res) => {
          expect(res.isCompatible).to.equal(true);
        })

        return runtimes._runtime.isCompatibleVersion('v2.0.0').then((res) => {
          expect(res.isCompatible).to.equal(true);
        })
      })

      it('compares two package json and returns if different', () => {
        return runtimes._runtime.hasDependencesChanged().then((hasChanged) => {
          expect(hasChanged).to.equal(true);
        });
      })
    });
  });
});
