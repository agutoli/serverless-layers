const BbPromise = require('bluebird');
const install = require('npm-install-package')
const mkdirp = require('mkdirp')
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const { spawnSync} = require('child_process');

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
      'package:initialize': () => BbPromise.bind(this)
        .then(() => this.main())
    }

    const inboundSettings = (serverless.service.custom || {})['serverless-layers'];
    const defaultSettings = {
      compileDir: '.layers-build',
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
        const output = Outputs.find(x => x.OutputKey === logicalId)
        if (!output) return null

        this.cacheObject.bucketName = output.OutputValue
        return output.OutputValue
      })
  }
// aws s3 ls s3://scup-serverless-deployments-qa/serverless/scup-bus-v1/qa/layers
  async publishLayerVersion() {
    const params = {
      Content: {
        S3Bucket: this.getBucketName(),
        S3Key: path.join(this.getBucketLayersPath(), this.getStackName() + '.zip'),
        // S3ObjectVersion: '2',
        // ZipFile: "sadasdas"
      },
      LayerName: this.getStackName(),
      CompatibleRuntimes: [ 'nodejs' ]
    }
    return this.provider.request('Lambda', 'publishLayerVersion', params)
      .then((result) => {
        console.log(result);
        // return this.log("Upload complete...")
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

      const output = fs.createWriteStream(this.getPathZipFileName())
      const zip = archiver.create('zip')

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
          resolve()
        })
    })
  }

  async uploadPackageLayer() {
    const params = {
      Bucket: this.getBucketName(),
      Key: path.join(this.getBucketLayersPath(), this.getStackName() + '.zip'),
      ContentType: "application/zip",
      ContentEncoding: "7bit",
      Body: fs.createReadStream(this.getPathZipFileName())
    }
    return this.provider.request('S3', 'upload', params)
      .then((result) => {
        this.log("Upload complete...")
        return result
      })
      .catch(e => {
        console.log(e.message)
        process.exit(1)
      })
  }

  uploadPackageJson() {
    this.log("Uploading package.json to bucket...")

    const params = {
      Bucket: this.getBucketName(),
      Key: path.join(this.getBucketLayersPath(), 'package.json'),
      Body: fs.createReadStream(this.settings.packagePath)
    }

    return this.provider.request('S3', 'putObject', params)
      .then(() => {
        return this.log("Upload complete...")
      })
      .catch(e => {
        console.log(e.message)
        process.exit(1)
      })
  }

  downloadPackageJson() {
    this.log("Downloading package.json from bucket...")

    const params = {
      Bucket: this.getBucketName(),
      Key: path.join(this.getBucketLayersPath(), 'package.json')
    }

    return this.provider.request('S3', 'getObject', params)
    .then((result) => {
      this.log("Download success...")
      return JSON.parse(result.Body.toString())
    }).catch(e => {
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
    const logicalId = this.provider.naming.getLambdaLayerOutputLogicalId(this.settings.layerName)
    return (outputs.find(x => x.OutputKey === logicalId)||{}).OutputValue
  }

  async main() {
    this.settings.layerName = this.settings.layerName || this.serverless.service.service

    const remotePackage = await this.downloadPackageJson()

    if (!remotePackage) {
      await this.installDependencies()
    }

    const res = await this.getLayerArn()
    // console.log(this.provider.naming.getLambdaLayerOutputLogicalId(this.settings.layerName))
    // console.log(this.provider.naming.getLambdaLayerLogicalId(this.settings.layerName))

    await this.installDependencies()
    await this.createPackageLayer()
    await this.uploadPackageLayer()
    // await this.publishLayerVersion()

    // const outputs = await this.getOutputs()

    // this.service.layers = {
    //   test: {
    //     path: ".layers/"
    //   }
    // }
    //
    // const functions = this.service.functions
    // for (const funcName in this.service.functions) {
    //   functions[funcName].layers = functions[funcName].layers || []
    //
    //   functions[funcName].layers.push('{Ref: test}')
    //   console.log(this.service.functions[funcName].layers);
    // }
  //   layers:
  // hello:

    // const remotePackage = await this.downloadPackageJson()
    //
    // if (!remotePackage) {
    //   console.log("diferente");
    // }
    //
    // const isDifferent = await this.isDiff(remotePackage.dependencies, this.localPackage.dependencies)
    // console.log(isDifferent);

    // await this.uploadPackageJson()
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

  log(msg) {
    this.serverless.cli.log(`Layers: ${msg}`)
  }
}

module.exports = ServerlessLayers;
