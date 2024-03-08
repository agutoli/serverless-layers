const { expect } = require('chai');
const lodash = require('lodash')
const sinon = require('sinon');
const Runtime = require('runtimes');

const nodejsConfig = require('./fixtures/nodejsConfig')
const pythonConfig = require('./fixtures/pythonConfig')

describe('Runtime', () => {
  describe('-> NodeJs', () => {
    let plugin;
    let runtimes;
    beforeEach(() => {
      plugin = {
        log: sinon.stub(),
        error: sinon.stub(),
        warn: sinon.stub()
      };

      lodash.set(plugin, 'service.provider.runtime', 'nodejs12.x');

      runtimes = new Runtime(plugin);
    });

    it('should merge settings with new values', () => {
      expect(runtimes.getDefaultSettings({
        packageManager: 'yarn',
        dependenciesPath: './fixtures/package.json'
      })).to.deep.equal(nodejsConfig);
    })

    describe('-> hasDependenciesChanges', () => {
      beforeEach(() => {
        const remoteDeps = JSON.stringify({
          dependencies: {
            express: '1.2.3'
          }
        })

        lodash.set(plugin, 'bucketService.downloadDependencesFile', () => Promise.resolve(remoteDeps));

        plugin.settings = runtimes.getDefaultSettings({
          packageManager: 'yarn',
          dependenciesPath: './tests/fixtures/package.json'
        })
        runtimes.init()
        runtimes._runtime.parent.run = () => 'v12.20.1';
      });

      it('checks if version is compatible', () => {

        return runtimes._runtime.isCompatibleVersion('v12.16').then((res) => {
          expect(res.isCompatible).to.equal(true);
        })
        .then(() => runtimes._runtime.isCompatibleVersion('v12.18.3').then((res) => {
          expect(res.isCompatible).to.equal(true);
        }));
      })

      it('compares two package json and returns if different', () => {
        return runtimes._runtime.hasDependenciesChanges().then((hasChanged) => {
          expect(hasChanged).to.equal(true);
        });
      })
    });
  });

  describe('-> Python', () => {
    let plugin;
    let runtimes;

    beforeEach(() => {
      plugin = {
        log: sinon.spy(),
        error: sinon.spy(),
      };
      process.exit = sinon.spy();
    });

    it('should throw error when undefined runtime', () => {
      lodash.set(plugin, 'service.provider.runtime', undefined);
      runtimes = new Runtime(plugin);
      expect(plugin.error.calledWith('service.provider.runtime is required!'))
        .to.equal(true);
      expect(process.exit.calledOnce).to.equal(true);
    })

    it('should throw error when invalid runtime', () => {
      lodash.set(plugin, 'service.provider.runtime', 'invalid');
      runtimes = new Runtime(plugin);
      expect(plugin.log.calledWith('"invalid" runtime is not supported (yet).'))
        .to.equal(true);
      expect(process.exit.calledOnce).to.equal(true);
    })
  });
});
