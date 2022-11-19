const { expect } = require('chai');
const fs = require('fs');
const lodashSet = require('lodash.set')
const sinon = require('sinon');
const Runtime = require('runtimes');

const nodejsConfig = require('./fixtures/nodejsConfig')
const pythonConfig = require('./fixtures/pythonConfig')
const packageJsonWithLocalDependency = require("./fixtures/package.with-local.json");

describe('Runtime', () => {
  describe('-> NodeJs', () => {
    let plugin;
    let runtimes;
    beforeEach(() => {
      plugin = {
        log: sinon.stub(),
        error: sinon.stub(),
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

    it('rebase local dependencies', () => {
      const packageJsonWithLocalDependency = require('./fixtures/package.with-local.json');
      fs.writeFileSync('./tests/fixtures/output/package.json', JSON.stringify(packageJsonWithLocalDependency));
      runtimes.rebaseLocalDependencies('./tests/fixtures/package.with-local.json', './tests/fixtures/output/');
      expect(require('./fixtures/output/package.json')).to.deep.equal(require('./fixtures/output/package.expected.json'));
    })

    describe('-> hasDependenciesChanges', () => {
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

    describe('-> hasDependenciesChanges with local dependency', () => {
      beforeEach(() => {
        const remoteDeps = JSON.stringify({
          dependencies: {
            'local-depth': 'file:../../folder'
          }
        })

        lodashSet(plugin, 'bucketService.downloadDependencesFile', () => Promise.resolve(remoteDeps));

        plugin.settings = runtimes.getDefaultSettings({
          packageManager: 'yarn',
          dependenciesPath: './tests/fixtures/package.with-local.json'
        })
        runtimes.init()
        runtimes._runtime.parent.run = () => 'v12.20.1';
      });

      it('package json with local dependency', () => {
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
      lodashSet(plugin, 'service.provider.runtime', undefined);
      runtimes = new Runtime(plugin);
      expect(plugin.error.calledWith('service.provider.runtime is required!'))
        .to.equal(true);
      expect(process.exit.calledOnce).to.equal(true);
    })

    it('should throw error when invalid runtime', () => {
      lodashSet(plugin, 'service.provider.runtime', 'invalid');
      runtimes = new Runtime(plugin);
      expect(plugin.log.calledWith('"invalid" runtime is not supported (yet).'))
        .to.equal(true);
      expect(process.exit.calledOnce).to.equal(true);
    })
  });
});
