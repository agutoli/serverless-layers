const BbPromise = require('bluebird');
const path = require('path');

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
        .then(() => this.init().then(() =>this.main())),
      'before:package:initialize': () => BbPromise.bind(this)
        .then(() => this.init().then(() =>this.main())),
      'aws:info:displayLayers': () => BbPromise.bind(this)
        .then(() => this.init())
        .then(() => this.finalizeDeploy()),
      'plugin:uninstall:uninstall': () => BbPromise.bind(this)
        .then(() => this.init())
        .then(() => this.cleanUpLayers()),
      'remove:remove': () => BbPromise.bind(this)
        .then(() => this.init())
        .then(() => this.cleanUpLayers()),
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

    this.runtimes = new Runtimes(this);

    this.settings = this.getSettings();

    this.zipService = new ZipService(this);
    this.dependencies = new Dependencies(this);
    this.layersService = new LayersService(this);
    this.bucketService = new BucketService(this);
    this.cloudFormationService = new CloudFormationService(this);

    this.initialized = true;
  }

  getSettings() {
    const inboundSettings = (this.serverless.service.custom || {})[
      'serverless-layers'
    ];
    return {
      compileDir: '.serverless',
      customInstallationCommand: null,
      layersDeploymentBucket: this.service.provider.deploymentBucket,
      ...this.runtimes.getDefaultSettings(inboundSettings)
    };
  }

  async main() {
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
    return `${path.join(process.cwd(), this.settings.compileDir, this.getStackName())}.zip`;
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
    if (this.cacheObject.LayerVersionArn) {
      return this.cacheObject.LayerVersionArn;
    }
    const outputs = await this.cloudFormationService.getOutputs();
    if (!outputs) return null;
    const logicalId = this.getOutputLogicalId();
    return (outputs.find(x => x.OutputKey === logicalId) || {}).OutputValue;
  }

  getOutputLogicalId() {
    return this.provider.naming.getLambdaLayerOutputLogicalId(this.getStackName());
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

    Object.keys(functions).forEach(funcName => {
      functions[funcName].layers = functions[funcName].layers || [];
      functions[funcName].layers.push(layerArn);
      this.log(`function.${funcName} - ${layerArn}`);
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
    const currentLayerARN = await this.getLayerArn();
    Object.keys(this.service.functions).forEach(funcName => {
      this.log(`function.${funcName} = layers.${currentLayerARN}`);
    });
  }

  log(msg) {
    this.serverless.cli.log(`[LayersPlugin]: ${msg}`);
  }

  warn(msg) {
    this.serverless.cli.log(chalk.yellowBright(`[LayersPlugin]: ${msg}`));
  }

  error(msg) {
    this.serverless.cli.log(chalk.red(`[LayersPlugin]: ${msg}`));
  }

  cleanUpLayers() {
    return this.layersService.cleanUpLayers();
  }
}

module.exports = ServerlessLayers;
