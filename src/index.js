const BbPromise = require('bluebird');
const path = require('path');
const slugify = require('slugify');
const chalk = require('chalk');
const Runtimes = require('./runtimes');
const LayersService = require('./aws/LayersService');
const BucketService = require('./aws/BucketService');
const CloudFormationService = require('./aws/CloudFormationService');
const ZipService = require('./package/ZipService');
const Dependencies = require('./package/Dependencies');

class ServerlessLayers {
  constructor(serverless, options) {
    this.cacheObject = {};
    this.options = options;
    this.serverless = serverless;
    this.initialized = false;

    // hooks
    this.hooks = {
      'before:package:function:package': () => BbPromise.bind(this)
        .then(() => {
          return this.init()
            .then(() => this.deployLayers())
        }),
      'before:package:initialize': () => BbPromise.bind(this)
        .then(() => {
          return this.init()
            .then(() => this.deployLayers())
        }),
      'aws:info:displayLayers': () => BbPromise.bind(this)
        .then(() => this.init())
        .then(() => this.finalizeDeploy()),
      'after:deploy:function:deploy': () => BbPromise.bind(this)
        .then(() => this.init())
        .then(() => this.finalizeDeploy()),
      'plugin:uninstall:uninstall': () => BbPromise.bind(this)
        .then(() => {
          return this.init()
            .then(() => this.cleanUpAllLayers())
        }),
      'remove:remove': () => BbPromise.bind(this)
        .then(() => {
          return this.init()
            .then(() => this.cleanUpAllLayers())
        })
    };
  }

  async init() {
    if (this.initialized) {
      return;
    }

    this.provider = this.serverless.getProvider('aws');
    this.service = this.serverless.service;
    this.options.region = this.provider.getRegion();

    // bindings
    this.log = this.log.bind(this);
    this.main = this.main.bind(this);

    const version = this.serverless.getVersion().replace(/\./g, '');

    if (version < 1340) {
      this.log(`Error: Please install serverless >= 1.34.0 (current ${this.serverless.getVersion()})`)
      process.exit(1);
    }
  }

  async deployLayers() {
    this.runtimes = new Runtimes(this);
    const settings = this.getSettings();
    const cliOpts = this.provider.options;

    for (const layerName in settings) {
      const currentSettings = settings[layerName];
      const enabledFuncs = currentSettings.functions;

      // deploying a single function
      const deploySingle = !!(cliOpts.function && enabledFuncs);

      // skip layers that is not related with specified function
      if (deploySingle && enabledFuncs.indexOf(cliOpts.function) === -1) {
        continue;
      }

      this.logGroup(layerName);
      await this.initServices(layerName, currentSettings);
      await this.main();
    }

    console.log('\n');
  }

  async cleanUpAllLayers() {
    this.runtimes = new Runtimes(this);
    const settings = this.getSettings();
    for (const layerName in settings) {
      const currentSettings = settings[layerName];
      this.logGroup(layerName);

      if (currentSettings.arn) {
        this.warn(` (skipped) arn: ${currentSettings.arn}`);
        continue;
      }

      await this.initServices(layerName, currentSettings);
      await this.cleanUpLayers();
    }
  }

  async initServices(layerName, settings) {
    this.currentLayerName = layerName;
    this.settings = settings;
    this.zipService = new ZipService(this);
    this.dependencies = new Dependencies(this);
    this.layersService = new LayersService(this);
    this.bucketService = new BucketService(this);
    this.cloudFormationService = new CloudFormationService(this);
    this.initialized = true;
  }

  mergeCommonSettings(inboundSetting) {
    return {
      functions: null,
      compileDir: '.serverless',
      customInstallationCommand: null,
      layersDeploymentBucket: this.service.provider.deploymentBucket,
      ...this.runtimes.getDefaultSettings(inboundSetting)
    };
  }

  getSettings() {
    const inboundSettings = (this.serverless.service.custom || {})[
      'serverless-layers'
    ];

    if (Array.isArray(inboundSettings)) {
      const settings = {};
      inboundSettings.forEach(inboundSetting => {
        const layerName = Object.keys(inboundSetting)[0];
        settings[layerName] = this.mergeCommonSettings(inboundSetting[layerName]);
      });
      return settings;
    }

    return {
      default: this.mergeCommonSettings(inboundSettings)
    }
  }

  async main() {
    // static ARN
    if (this.settings.arn) {
      this.relateLayerWithFunctions(this.settings.arn);
      return;
    }

    await this.runtimes.init();
    await this.dependencies.init();

    const isDifferent = await this.runtimes.hasDependencesChanged();

    // merge package default options
    this.mergePackageOptions();

    const currentLayerARN = await this.getLayerArn();
    if (!isDifferent && currentLayerARN) {
     this.log(`Not has changed! Using same layer arn: ${currentLayerARN}`);
     this.relateLayerWithFunctions(currentLayerARN);
     return;
    }

    await this.dependencies.install();
    await this.zipService.package();
    await this.bucketService.uploadZipFile();
    const version = await this.layersService.publishVersion();
    await this.bucketService.uploadDependencesFile();

    this.relateLayerWithFunctions(version.LayerVersionArn);
  }

  getLayerName() {
    const stackName = this.getStackName();
    const { runtimeDir } = this.settings;
    return slugify(`${stackName}-${runtimeDir}-${this.currentLayerName}`, {
      lower: true,
      replacement: '-'
    });
  }

  getStackName() {
    return this.provider.naming.getStackName();
  }

  getBucketName() {
    if (!this.settings.layersDeploymentBucket) {
      throw new Error(
        'Please, you should specify "deploymentBucket" or "layersDeploymentBucket" option for this plugin!\n'
      );
    }
    return this.settings.layersDeploymentBucket;
  }

  getPathZipFileName() {
    return `${path.join(process.cwd(), this.settings.compileDir, this.getLayerName())}.zip`;
  }

  getBucketLayersPath() {
    const serviceStage = `${this.serverless.service.service}/${this.options.stage}`;

    let deploymentPrefix = 'serverless';
    if (this.provider.getDeploymentPrefix) {
      deploymentPrefix = this.provider.getDeploymentPrefix();
    }

    return path.join(
      deploymentPrefix,
      serviceStage,
      'layers'
    ).replace(/\\/g, '/');
  }

  async getLayerArn() {
    if (!this.cacheObject.layersArn) {
      this.cacheObject.layersArn = {};
    }

    // returns cached arn
    if (this.cacheObject.layersArn[this.currentLayerName]) {
      return this.cacheObject.layersArn[this.currentLayerName];
    }

    const outputs = await this.cloudFormationService.getOutputs();
    

    if (!outputs) return null;

    const logicalId = this.getOutputLogicalId();

    const arn = (outputs.find(x => x.OutputKey === logicalId) || {}).OutputValue;

    // cache arn
    this.cacheObject.layersArn[this.currentLayerName] = arn;
  
    return arn;
  }

  getOutputLogicalId() {
    const value = this.getLayerName().replace(this.getStackName() + '-', '');
    return this.provider.naming.getLambdaLayerOutputLogicalId(value);
  }

  mergePackageOptions() {
    const { packageExclude } = this.settings;
    const pkg = this.service.package;

    const opts = {
      individually: false,
      excludeDevDependencies: false,
      exclude: []
    };

    this.service.package = {...opts, ...pkg};

    for (const excludeFile of packageExclude) {
      const hasRule = (this.service.package.exclude || '').indexOf(excludeFile);
      if (hasRule === -1) {
        this.service.package.exclude.push(excludeFile);
      }
    }
  }

  relateLayerWithFunctions(layerArn) {
    this.log('Associating layers...');
    const { functions } = this.service;
    const funcs = this.settings.functions;
    const cliOpts = this.provider.options;

    Object.keys(functions).forEach(funcName => {
      if (cliOpts.function && cliOpts.function !== funcName) {
        return;
      }

      let isEnabled = !funcs;

      if (Array.isArray(funcs) && funcs.indexOf(funcName) !== -1) {
        isEnabled = true;
      }

      if (isEnabled) {
        functions[funcName].layers = functions[funcName].layers || [];
        functions[funcName].layers.push(layerArn);
        functions[funcName].layers = Array.from(new Set(functions[funcName].layers));
        this.log(`function.${funcName} - ${chalk.bold(layerArn)}`, ' ✓');
      } else {
        this.warn(`(Skipped) function.${funcName}`, ` x`);
      }
    });

    this.service.resources = this.service.resources || {};
    this.service.resources.Outputs = this.service.resources.Outputs || {};

    const outputName = this.getOutputLogicalId();

    Object.assign(this.service.resources.Outputs, {
      [outputName]: {
        Value: layerArn,
        Export: {
          Name: outputName
        }
      }
    });
  }

  getDependenciesList() {
    return Object.keys((this.localPackage.dependencies||[])).map(x => (
      `${x}@${this.localPackage.dependencies[x]}`
    ));
  }

  async finalizeDeploy() {
    const cliOpts = this.provider.options;
    this.logGroup("Layers Info");
    Object.keys(this.service.functions).forEach(funcName => {
      const lambdaFunc = this.service.functions[funcName];
      const layers = lambdaFunc.layers || [];

      if (!cliOpts.function && layers.length === 0) {
        this.warn(`(skipped) function.${funcName}`);
        return;
      }
      
      layers.forEach((currentLayerARN) => {
        if (cliOpts.function && cliOpts.function === funcName) {
          this.log(`function.${funcName} = layers.${chalk.bold(currentLayerARN)}`);
          return;
        }
        this.log(`function.${funcName} = layers.${chalk.bold(currentLayerARN)}`);
      });
    });
    console.log('\n');
  }

  log(msg, signal=' ○') {
    console.log('...' + `${chalk.greenBright.bold(signal)} ${chalk.white(msg)}`);
  }

  logGroup(msg) {
    console.log('\n');
    this.serverless.cli.log(`[ LayersPlugin ]: ${chalk.magenta.bold('=>')} ${chalk.greenBright.bold(msg)}`);
  }

  warn(msg, signal=' ∅') {
    console.log('...' + chalk.yellowBright(`${chalk.yellowBright.bold(signal)} ${msg}`));
  }

  error(msg, signal=' ⊗') {
    console.log('...' + chalk.red(`${signal} ${chalk.white.bold(msg)}`));
  }

  cleanUpLayers() {
    return this.layersService.cleanUpLayers();
  }
}

module.exports = ServerlessLayers;
