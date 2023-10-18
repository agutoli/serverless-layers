const BbPromise = require('bluebird');
const path = require('path');
const slugify = require('slugify');
const chalk = require('chalk');
const semver = require('semver');
const Runtimes = require('./runtimes');
const LayersService = require('./aws/LayersService');
const BucketService = require('./aws/BucketService');
const CloudFormationService = require('./aws/CloudFormationService');
const ZipService = require('./package/ZipService');
const LocalFolders = require('./package/LocalFolders');
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
      'after:deploy:deploy': () => BbPromise.bind(this)
        .then(() => this.init())
        .then(() => this.cleanUpLayerVersions()),
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

    const version = this.serverless.getVersion();

    if (semver.lt(version, '1.34.0')) {
      this.log(`Error: Please install serverless >= 1.34.0 (current ${this.serverless.getVersion()})`);
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

    this.breakLine();
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

  async cleanUpLayerVersions() {
    this.runtimes = new Runtimes(this);
    const settings = this.getSettings();

    for (const layerName in settings) {
      const currentSettings = settings[layerName];
      this.logGroup(layerName);

      if (currentSettings.arn) {
        this.warn(` (skipped) arn: ${currentSettings.arn}`);
        continue;
      }

      if (!currentSettings.retainVersions) {
        continue;
      }

      this.log('Cleaning up layer versions...');

      await this.initServices(layerName, currentSettings);
      await this.cleanUpLayers(currentSettings.retainVersions);
    }
  }

  async initServices(layerName, settings) {
    this.currentLayerName = layerName;
    this.settings = settings;
    this.zipService = new ZipService(this);
    this.dependencies = new Dependencies(this);
    this.localFolders = new LocalFolders(this);
    this.layersService = new LayersService(this);
    this.bucketService = new BucketService(this);
    this.cloudFormationService = new CloudFormationService(this);
    this.initialized = true;
  }

  mergeCommonSettings(inboundSetting) {
    const { deploymentBucketObject } = this.service.provider;

    let layersDeploymentBucketEncryption;
    if (deploymentBucketObject) {
      layersDeploymentBucketEncryption = deploymentBucketObject.serverSideEncryption;
    }

    return {
      path: '.',
      functions: null,
      forceInstall: false,
      retainVersions: null,
      dependencyInstall: true,
      compileDir: '.serverless',
      customInstallationCommand: null,
      layersDeploymentBucket: this.service.provider.deploymentBucket,
      layersDeploymentBucketEncryption,
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

  hasSettingsChanges() {
    // don't check settings changes twice
    if (this.hasSettingsVerified) {
      return false;
    }

    const manifest = '__meta__/manifest-settings.json';
    const currentSettings = JSON.stringify({
      ...this.settings,
      patterns: this.service.package.patterns
    });

    // settings checked
    this.hasSettingsVerified = true;

    return this.bucketService.getFile(manifest).then((remoteSettings) => {

      // create and return true (changed)
      if (!remoteSettings) {
        return this.bucketService.putFile(manifest, currentSettings)
          .then(() => true);
      }

      if (remoteSettings !== currentSettings) {
        return this.bucketService.putFile(manifest, currentSettings)
          .then(() => true);
      }

      return false;
    });
  }

  async hasCustomHashChanged() {
    if (!this.settings.customHash) {
      return false;
    }

    const hashFileName = 'customHash.json';
    const remoteHashFile = await this.bucketService.getFile(hashFileName);

    if (!remoteHashFile) {
      this.log('no previous custom hash found, putting new remote hash');
      await this.bucketService.putFile(
        hashFileName, JSON.stringify({ hash: this.settings.customHash })
      );
      return true;
    }

    const { hash: remoteHash } = JSON.parse(remoteHashFile);
    if (remoteHash === this.settings.customHash) {
      return false;
    }

    await this.bucketService.putFile(
      hashFileName, JSON.stringify({ hash: this.settings.customHash })
    );
    this.log('identified custom hash change!');
    return true;
  }

  async main() {
    const {
      arn,
      localDir,
      artifact,
      forceInstall,
      dependencyInstall
    } = this.settings;

    // static ARN
    if (arn) {
      this.relateLayerWithFunctions(arn);
      return;
    }

    await this.runtimes.init();
    await this.dependencies.init();
    await this.localFolders.init();

    // it avoids issues if user changes some configuration
    // which will not be applied till dependencies be changed
    let hasSettingsChanges = await this.hasSettingsChanges();

    // check if directories content has changed
    // comparing hash md5 remote with local folder
    let hasFoldersChanges = false;
    if (localDir) {
      hasFoldersChanges = await this.localFolders.hasFoldersChanges();
    }

    // check if dependencies has changed comparing
    // remote package.json with local one
    let hasDepsChanges = false;
    if (dependencyInstall) {
      hasDepsChanges = await this.runtimes.hasDependenciesChanges();
    }

    let hasZipChanged = false;
    if (artifact) {
      hasZipChanged = await this.zipService.hasZipChanged();
    }

    const hasCustomHashChanged = await this.hasCustomHashChanged();

    // It checks if something has changed
    let verifyChanges = [
      hasZipChanged,
      hasDepsChanges,
      hasFoldersChanges,
      hasSettingsChanges,
      hasCustomHashChanged,
    ].some(x => x === true);

    // merge package default options
    this.mergePackageOptions();

    // It returns the layer arn if exists.
    const existentLayerArn = await this.getLayerArn();

    // It improves readability
    const skipInstallation = (
      !verifyChanges && !forceInstall && existentLayerArn
    );

    /**
     * If no changes, and layer arn available,
     * it doesn't require re-installing dependencies.
     */
    if (skipInstallation) {
     this.log(`${chalk.inverse.green(' No changes ')}! Using same layer arn: ${this.logArn(existentLayerArn)}`);
     this.relateLayerWithFunctions(existentLayerArn);
     return;
    }

    // ENABLED by default
    if (dependencyInstall && !artifact) {
      await this.dependencies.install();
    }

    if (localDir && !artifact) {
      await this.localFolders.copyFolders();
    }

    await this.zipService.package();
    await this.bucketService.uploadZipFile();
    const version = await this.layersService.publishVersion();
    await this.bucketService.putFile(this.dependencies.getDepsPath());

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

  getBucketEncryptiom() {
    return this.settings.layersDeploymentBucketEncryption;
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
    if (this.settings.artifact) {
      return `${path.join(process.cwd(), this.settings.artifact)}`;
    }
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
    return this.provider.naming.getLambdaLayerOutputLogicalId(this.getLayerName());
  }

  mergePackageOptions() {
    const { packagePatterns, artifact } = this.settings;
    const pkg = this.service.package;

    const opts = {
      individually: false,
      excludeDevDependencies: false,
      patterns: []
    };

    this.service.package = {...opts, ...pkg};

    for (const excludeFile of packagePatterns) {
      const hasRule = (this.service.package.patterns || '').indexOf(excludeFile);
      if (hasRule === -1) {
        this.service.package.patterns.push(excludeFile);
      }
    }

    if (artifact) {
      this.service.package.patterns.push(artifact);
    }
  }

  relateLayerWithFunctions(layerArn) {
    this.log('Adding layers...');
    const { functions } = this.service;
    const funcs = this.settings.functions;
    const cliOpts = this.provider.options;

    // Attaches to provider level when
    // no functions available. It happens when
    // someone want to use serverless to create all layers
    // or resources but not the functions.
    if (!functions || Object.keys(functions).length === 0) {
      // Simple validations when layers attribute is null.
      if (!this.service.provider.layers) {
        this.service.provider.layers = []
      }

      this.service.provider.layers.push(layerArn);

      this.log(
        `${chalk.magenta.bold('provider')} - ${this.logArn(layerArn)}`,
        ' ✓'
      );
    } else {
      Object.keys(functions).forEach(funcName => {
        if (cliOpts.function && cliOpts.function !== funcName) {
          return;
        }

        let isEnabled = !funcs;

        if (Array.isArray(funcs) && funcs.indexOf(funcName) !== -1) {
          isEnabled = true;
        }

        if (isEnabled) {
          // if this function has other layers add ours too so it applies
          functions[funcName].layers = functions[funcName].layers || [];
          functions[funcName].layers.push(layerArn);
          functions[funcName].layers = Array.from(new Set(functions[funcName].layers));
          this.log(`function.${chalk.magenta.bold(funcName)} - ${this.logArn(layerArn)}`, ' ✓');
        } else {
          this.warn(`(Skipped) function.${chalk.magenta.bold(funcName)}`, ` x`);
        }
      });
    }

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
        this.warn(`(skipped) function.${chalk.magenta.bold(funcName)}`);
        return;
      }

      layers.forEach((currentLayerARN) => {
        if (cliOpts.function && cliOpts.function === funcName) {
          this.log(`function.${chalk.magenta.bold(funcName)} = layers.${this.logArn(currentLayerARN)}`);
          return;
        }
        this.log(`function.${chalk.magenta.bold(funcName)} = layers.${this.logArn(currentLayerARN)}`);
      });
    });
    this.breakLine();
  }

  log(msg, signal=' ○') {
    console.log('...' + `${chalk.greenBright.bold(signal)} ${chalk.white(msg)}`);
  }

  logGroup(msg) {
    this.breakLine();
    this.serverless.cli.log(`[ LayersPlugin ]: ${chalk.magenta.bold('=>')} ${chalk.greenBright.bold(msg)}`);
  }

  warn(msg, signal=' ∅') {
    console.log('...' + chalk.yellowBright(`${chalk.yellowBright.bold(signal)} ${msg}`));
  }

  error(msg, signal=' ⊗') {
    console.log('...' + chalk.red(`${signal} ${chalk.white.bold(msg)}`));
  }

  cleanUpLayers(retainVersions) {
    return this.layersService.cleanUpLayers(retainVersions);
  }

  breakLine() {
    console.log('\n');
  }

  logArn(arn) {
    let pattern = /arn:aws:lambda:([^:]+):([0-9]+):layer:([^:]+):([0-9]+)/g;
    let region = chalk.bold('$1');
    let name = chalk.magenta('$3');
    let formated = chalk.white(`arn:aws:lambda:${region}:*********:${name}:$4`);

    let text = "";
    switch (typeof arn) {
      case 'object':
        if (arn.Ref) {
          text = `logicalId:[${chalk.bold('Ref')}=`;
          text += `${chalk.magenta(arn.Ref)}]`;
        }
        break;
      case 'string':
        text = arn;
        break;
      default:
        text = String(arn);
        break;
    }
    return text.replace(pattern, formated);
  }
}

module.exports = ServerlessLayers;
