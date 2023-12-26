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
        copyAfterInstall: [],
        optimization: {
          cleanupPatterns: [
            "node_modules/aws-sdk/**",
            "node_modules/@types/**",
            "node_modules/**/.github",
            "node_modules/**/.lint",
            "node_modules/**/Gruntfile.js",
            "node_modules/**/.jshintrc",
            "node_modules/**/.nycrc",
            "node_modules/**/.nvmrc",
            "node_modules/**/.editorconfig",
            "node_modules/**/.npmignore",
            "node_modules/**/bower.json",
            "node_modules/**/.eslint*",
            "node_modules/**/.gitignore",
            "node_modules/**/*.ts",
            "node_modules/**/README.*",
            "node_modules/**/LICENSE",
            "node_modules/**/LICENSE.md",
            "node_modules/**/CHANGES",
            "node_modules/**/HISTORY.md",
            "node_modules/**/CHANGES.md",
            "node_modules/**/CHANGELOG.md",
            "node_modules/**/sponsors.md",
            "node_modules/**/license.txt",
            "node_modules/**/tsconfig.json",
            "node_modules/**/test/*.js",
            "node_modules/**/*.test.js",
            "node_modules/**/*.spec.js",
            "node_modules/**/.travis.y*ml",
            "node_modules/**/yarn.lock",
            "node_modules/**/.package-lock.json",
            "node_modules/**/*.md",
          ]
        },
        serverless: {
          package: {
            individually: true,
            patterns: [
              "!.npmrc",
              "!.gitignore",
              "!README.md",
              "!.eslintrc",
              "!.jshintrc",
              "!.vscode/",
              "!.idea/",
              "!yarn.lock",
              "!node_modules/**",
              "!package-lock.json",
            ]
          }
        }
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
        optimization: {
          cleanupPatterns: [

          ]
        },
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
          package: {
            individually: true,
            patterns: [
              "!.gitignore",
              "!README.md",
              "!.vscode/",
              "!.idea/",
              "yarn.lock",
              "package.json",
              "package-lock.json",
              "node_modules/**",
              "vendor/**",
              ".bundle",
            ]
          }
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
