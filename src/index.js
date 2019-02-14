const BbPromise = require('bluebird');
const install = require('npm-install-package')
const mkdirp = require('mkdirp')
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

const MAX_LAYER_MB_SIZE = 250

class ServerlessLayers {
  constructor(serverless, options) {
    this.cacheObject = {}
    this.options = options
    this.serverless = serverless

    this.service = serverless.service
    this.provider = serverless.getProvider('aws')
    this.options.region = this.provider.getRegion()

    // bindings
    this.log = this.log.bind(this)
    this.main = this.main.bind(this)

    // hooks
    this.hooks = {
      'package:createDeploymentArtifacts': () => BbPromise.bind(this)
        .then(() => this.main()),
      'aws:info:displayLayers': () => BbPromise.bind(this)
          .then(() => this.finalizeDeploy())
    }

    const inboundSettings = (serverless.service.custom || {})['serverless-layers'];
    const defaultSettings = {
      compileDir: '.serverless',
      packagePath: path.join(process.env.PWD, `package.json`),
    }

    this.settings = Object.assign({}, defaultSettings, inboundSettings);
    this.localPackage = require(defaultSettings.packagePath)
  }

  getStackName() {
    return `${this.serverless.service.service}-${this.options.stage}`
  }

  getOutputs() {
    const params = { StackName: this.getStackName()}
    const logicalId = this.provider.naming.getDeploymentBucketOutputLogicalId()
    return this.provider.request('CloudFormation', 'describeStacks', params)
      .then(({ Stacks }) => Stacks && Stacks[0].Outputs)
      .catch(e => {
        return []
      })
  }

  getBucketName() {
    if (this.service.provider.deploymentBucket) {
      return this.service.provider.deploymentBucket
    }

    if (this.cacheObject.bucketName) {
      return this.cacheObject.bucketName
    }

    return this.getOutputs()
      .then(Outputs => {
        const output = Outputs.find(x => x.OutputKey === 'ServerlessDeploymentBucketName')

        if (!output) {
          return null
        }

        this.cacheObject.bucketName = output.OutputValue
        return output.OutputValue
      })
  }

  async publishLayerVersion() {
    const bucketName = await this.getBucketName()
    const params = {
      Content: {
        S3Bucket: bucketName,
        S3Key: path.join(this.getBucketLayersPath(), this.getStackName() + '.zip')
      },
      LayerName: this.getStackName(),
      CompatibleRuntimes: [ 'nodejs' ]
    }
    return this.provider.request('Lambda', 'publishLayerVersion', params)
      .then((result) => {
        this.log("New layer version published...")
        return result
      })
      .catch(e => {
        console.log(e.message)
        process.exit(1)
      })
  }

  getPathZipFileName() {
    return path.join(process.cwd(), this.settings.compileDir, this.getStackName() + '.zip')
  }

  createPackageLayer() {
    return new Promise((resolve) => {
      const layersDir = path.join(process.cwd(), this.settings.compileDir)
      const oldCwd = process.cwd()
      const zipFileName = this.getPathZipFileName()
      const output = fs.createWriteStream(zipFileName)
      const zip = archiver.create('zip')

      output.on('close', () => {
        const MB = (zip.pointer()/1024/1024).toFixed(1)

        if (MB > MAX_LAYER_MB_SIZE) {
          this.log("Package error!")
          throw new Error(
            "Layers can't exceed the unzipped deployment package size limit of 250 MB! \n" +
            "Read more: https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html\n\n"
          )
        }

        this.log(`Created layer package ${zipFileName} (${MB}MB)`);
        resolve()
      })

      zip.on('error', (err) => {
        reject(err)
        process.chdir(oldCwd)
      });

      process.chdir(layersDir)

      zip.pipe(output);

      zip.directory('layers', false)

      zip.finalize()
        .then(() => {
          process.chdir(oldCwd)
        })
    })
  }

  async uploadPackageLayer() {
    this.log("Uploading layer package...")

    const bucketName = await this.getBucketName()
    const params = {
      Bucket: bucketName,
      Key: path.join(this.getBucketLayersPath(), this.getStackName() + '.zip'),
      Body: fs.createReadStream(this.getPathZipFileName())
    }

    return this.provider.request('S3', 'putObject', params)
      .then((result) => {
        this.log("OK...")
        return result
      })
      .catch(e => {
        console.log(e.message)
        process.exit(1)
      })
  }

  async uploadPackageJson() {
    this.log("Uploading remote package.json...")

    const bucketName = await this.getBucketName()
    const params = {
      Bucket: bucketName,
      Key: path.join(this.getBucketLayersPath(), 'package.json'),
      Body: fs.createReadStream(this.settings.packagePath)
    }
    return this.provider.request('S3', 'putObject', params)
      .then((result) => {
        this.log("OK...")
        return result
      })
      .catch(e => {
        console.log(e.message)
        process.exit(1)
      })
  }

  async downloadPackageJson() {
    this.log("Downloading package.json from bucket...")
    const bucketName = await this.getBucketName()
    const params = {
      Bucket: bucketName,
      Key: path.join(this.getBucketLayersPath(), 'package.json')
    }
    return this.provider.request('S3', 'getObject', params)
    .then((result) => JSON.parse(result.Body.toString()))
    .catch(e => {
      this.log("package.json does not exists at bucket...")
      return null
    })
  }

  getBucketLayersPath() {
    const serviceStage = `${this.serverless.service.service}/${this.options.stage}`;
    return path.join(
      this.provider.getDeploymentPrefix(),
      serviceStage,
      'layers'
    )
  }

  async getLayerArn() {
    const outputs = await this.getOutputs()
    if (!outputs) return
    const logicalId = this.getOutputLogicalId()
    return (outputs.find(x => x.OutputKey === logicalId)||{}).OutputValue
  }

  getOutputLogicalId() {
    return this.provider.naming.getLambdaLayerOutputLogicalId(this.getStackName())
  }

  relateLayerWithFunctions(layerArn) {
    this.log('Associating layers...')

    const functions = this.service.functions
    for (const funcName in this.service.functions) {
      functions[funcName].layers = functions[funcName].layers || []
      functions[funcName].layers.push(layerArn)
      this.log('function.' + funcName + ' OK...')
    }

    this.service.resources = this.service.resources || {}
    this.service.resources.Outputs = this.service.resources.Outputs || {}

    const outputName = this.getOutputLogicalId()
    Object.assign(this.service.resources.Outputs, {
      [outputName]: {
        Value: layerArn,
        Export: {
          Name: outputName
        }
      }
    })
  }

  async main() {
    this.settings.layerName = this.settings.layerName || this.serverless.service.service

    const remotePackage = await this.downloadPackageJson()

    let isDifferent = true
    if (remotePackage) {
      this.log(`Comparing package.json dependencies...`)
      isDifferent = await this.isDiff(remotePackage.dependencies, this.localPackage.dependencies)
    }

    const currentLayerARN = await this.getLayerArn()

    if (!isDifferent && currentLayerARN) {
      this.log(`Not has changed! Using same layer arn: ${currentLayerARN}`)
      this.relateLayerWithFunctions(currentLayerARN)
      return
    }

    await this.installDependencies()
    await this.uploadPackageJson()
    await this.createPackageLayer()
    await this.uploadPackageLayer()
    const version = await this.publishLayerVersion()

    return this.relateLayerWithFunctions(version.LayerVersionArn)
  }

  isDiff(depsA, depsB) {
    const depsKeyA = Object.keys(depsA)
    const depsKeyB = Object.keys(depsB)
    const isSizeEqual = depsKeyA.length === depsKeyB.length

    if (!isSizeEqual) return true

    for(let dependence in depsA) {
      if (depsA[dependence] !== depsB[dependence]) {
        return true
      }
    }
    return false
  }

  getDependenciesList() {
    return Object.keys(this.localPackage.dependencies).map(x => (
      `${x}@${this.localPackage.dependencies[x]}`
    ))
  }

  async installDependencies() {
    this.log(`Dependencies has changed! Re-installing...`)

    const initialCwd = process.cwd()
    const nodeJsDir = path.join(process.cwd(), this.settings.compileDir, 'layers', 'nodejs')

    await mkdirp.sync(nodeJsDir)

    fs.copyFileSync(this.settings.packagePath, path.join(nodeJsDir, 'package.json'));

    // install deps
    process.chdir(nodeJsDir)

    const opts = { saveDev: false, cache: true, silent: false }

    return new Promise((resolve) => {
      install(this.getDependenciesList(), opts, function (err) {
        process.chdir(initialCwd);
        if (err) throw err
        resolve()
      })
    })
  }

  async finalizeDeploy() {
    const currentLayerARN = await this.getLayerArn()
    const functions = this.service.functions
    for (const funcName in this.service.functions) {
      this.log(`function.${funcName} = layers.${currentLayerARN}`)
    }
  }

  log(msg) {
    this.serverless.cli.log(`[LayersPlugin]: ${msg}`)
  }
}

module.exports = ServerlessLayers;
