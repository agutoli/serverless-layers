const fs = require('fs');
const path = require('path');

const S3Key = require('./S3Key');
const AbstractService = require('../AbstractService');

class UploadService extends AbstractService {
  keyPath(filename) {
    let value = path.join(this.plugin.getBucketLayersPath(), filename);
    if (/^win/.test(process.platform)) {
      value = value.replace(/\\/g, '/');
    }
    return value;
  }

  async uploadZipFile() {
    this.plugin.log('Uploading layer package...');

    const params = {
      Bucket: this.bucketName,
      Key: this.zipFileKeyName,
      ServerSideEncryption: this.plugin.getBucketEncryptiom(),
      Body: fs.createReadStream(this.plugin.getPathZipFileName())
    };

    return this.awsRequest('S3:putObject', params, { checkError: true })
      .then((result) => {
        this.plugin.log('OK...');
        return result;
      });
  }

  async putFile(filename, body) {
    const file = new S3Key(filename);
    this.plugin.log(`Uploading remote ${filename}...`);

    let Body = body;

    if (!body) {
      Body = file.getStream();
    }

    const params = {
      Body,
      Bucket: this.bucketName,
      Key: this.keyPath(file.getKey()),
      ServerSideEncryption: this.plugin.getBucketEncryptiom()
    };

    return this.awsRequest('S3:putObject', params, { checkError: true })
      .then((result) => {
        this.plugin.log('OK...');
        return result;
      });
  }

  async getFile(filename) {
    const file = new S3Key(filename);
    this.plugin.log(`Downloading ${file.getKey()} from bucket...`);

    const params = {
      Bucket: this.bucketName,
      Key: this.keyPath(file.getKey())
    };

    return this.awsRequest('S3:getObject', params)
      .then((result) => result.Body.toString())
      .catch((e) => {
        this.plugin.log(`${filename} ${e.message}.`);
        return null;
      });
  }

  async uploadDependencesFile() {
    const { dependenciesPath } = this.plugin.settings;

    this.plugin.log(`Uploading remote ${dependenciesPath}...`);

    const params = {
      Bucket: this.bucketName,
      Key: this.dependenceFilename,
      ServerSideEncryption: this.plugin.getBucketEncryptiom(),
      Body: fs.createReadStream(this.plugin.settings.dependenciesPath)
    };

    return this.awsRequest('S3:putObject', params, { checkError: true })
      .then((result) => {
        this.plugin.log('OK...');
        return result;
      });
  }

  async downloadDependencesFile() {
    const { dependenciesPath } = this.plugin.settings;
    this.plugin.log(`Downloading ${dependenciesPath} from bucket...`);

    const params = {
      Bucket: this.bucketName,
      Key: this.dependenceFilename
    };

    return this.awsRequest('S3:getObject', params)
      .then((result) => result.Body.toString())
      .catch((e) => {
        this.plugin.log(`${dependenciesPath} ${e.message}.`);
        return null;
      });
  }
}

module.exports = UploadService;
