import {mocksInit} from './_utils';

import {RuntimeResolver} from '../src/core/Runtime';
import {LayerConfig} from '../src/core/LayerConfig';

import {RubyRuntimeAdapter} from '../src/runtimes/RubyAdapter';
import {NodeJsRuntimeAdapter} from '../src/runtimes/NodeJsAdapter';
import {PythonRuntimeAdapter} from '../src/runtimes/PythonAdapter';

const createConfiguration = (params: any = {}) => {
  // facade mock
  const facade = mocksInit.serverlessFacade(params);

  const resolver: any = new RuntimeResolver(facade);
  resolver.registerAdapter(new RubyRuntimeAdapter);
  resolver.registerAdapter(new NodeJsRuntimeAdapter);
  resolver.registerAdapter(new PythonRuntimeAdapter);

  const runtime = resolver.resolve();
  const layersConfig = runtime.getLayersConfig();

  return {layersConfig, runtime, facade};
}

describe('LayerConfig', () => {
  let facade: any;
  let runtime: any;
  let layersConfig: any;

  describe('Common', () => {
    beforeEach(() => {
      const result = createConfiguration({
        runtime: 'nodejs14.x'
      });
      facade = result.facade;
    });
    it('assert constructor calls', () => {
      expect(facade.getRuntime).toHaveBeenCalled();
    });
  });

  describe('NodeJs', () => {
    beforeEach(() => {
      const result = createConfiguration({
        runtime: "nodejs14.x",
        deploymentBucketName: 'my-test-bucket',
        customConfigs: [
          {
            default: {
              path: '/app'
            }
          }
        ]
      });
      facade = result.facade;
      runtime = result.runtime;
      layersConfig = result.layersConfig;
    });


    it('dependencyAbsPath() returns dependency file path', () => {
      expect(layersConfig[0].dependencyAbsPath()).toEqual('/app/package.json');
    });

    it('layerPackagePath() returns layer folder path', () => {
      expect(layersConfig[0].layerPackagePath()).toEqual('/app/.serverless/layers/nodejs');
    });

    it('defaults configurations', () => {
      const configs = layersConfig[0].toJSON();

      expect(configs).toEqual({
        path: '/app',
        compileDir: '.serverless',
        functions: null,
        forceInstall: false,
        runtimeDir: 'nodejs',
        runtime: 'nodejs14.x',
        packageManager: 'npm',
        dependencyInstall: true,
        layerConfigKey: "default",
        deploymentBucket: 'my-test-bucket',
        dependenciesPath: 'package.json',
        packageManagerExtraArgs: '',
        libraryFolder: 'node_modules',
        customInstallationCommand: null,
        compatibleRuntimes: ['nodejs14.x'],
        compatibleArchitectures: ['x86_64', 'arm64'],
        copyBeforeInstall: [
          '.npmrc',
          'yarn.lock',
          'package-lock.json'
        ],
        copyAfterInstall: []
      });
    });
  });

  describe('Ruby', () => {
    beforeEach(() => {
      const result = createConfiguration({
        runtime: "ruby2.7",
        deploymentBucketName: 'my-test-bucket',
        customConfigs: [
          {
            default: {
              path: '/app'
            }
          }
        ]
      });
      facade = result.facade;
      runtime = result.runtime;
      layersConfig = result.layersConfig;
    });

    it('defaults configurations', () => {
      expect(layersConfig[0].toJSON()).toEqual({
        path: '/app',
        layerConfigKey: "default",
        compileDir: '.serverless',
        functions: null,
        forceInstall: false,
        runtimeDir: 'ruby',
        runtime: 'ruby2.7',
        packageManager: 'bundle',
        dependencyInstall: true,
        dependenciesPath: 'Gemfile',
        packageManagerExtraArgs: '',
        libraryFolder: 'gems',
        deploymentBucket: 'my-test-bucket',
        customInstallationCommand: null,
        compatibleRuntimes: ['ruby2.7'],
        compatibleArchitectures: ['x86_64', 'arm64'],
        copyAfterInstall: [
          { from: 'ruby', to: 'gems' }
        ],
        copyBeforeInstall: [
          'Gemfile.lock'
        ],
        serverless: {
          package: [
            'yarn.lock',
            'package.json',
            'package-lock.json',
            'node_modules/**',
            'vendor/**',
            '.bundle'
          ]
        }
      });
    });
  });

  describe('Multiple layers configs', () => {
    beforeEach(() => {
      const result = createConfiguration({
        runtime: "nodejs14.x",
        customConfigs: [
          {
            foo: {
              packageManager: 'npm'
            }
          },
          {
            bar: {
              packageManager: 'yarn'
            }
          }
        ]
      });
      facade = result.facade;
      runtime = result.runtime;
      layersConfig = result.layersConfig;
    });

    it('tests when set custom value to packageManager', () => {
      expect(layersConfig[0].toJSON().packageManager).toEqual("npm");
      expect(layersConfig[1].toJSON().packageManager).toEqual("yarn");
    });
  });
});
