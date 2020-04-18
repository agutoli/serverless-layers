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
      Body: fs.createReadStream(this.plugin.getPathZipFileName())
    };

    return this.provider.request('S3', 'putObject', params)
      .then((result) => {
        this.plugin.log('OK...');
        return result;
      })
      .catch(e => {
        console.log(e.message);
        process.exit(1);
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
      Key: this.keyPath(file.getKey())
    };

    return this.provider.request('S3', 'putObject', params)
      .then((result) => {
        this.plugin.log('OK...');
        return result;
      })
      .catch(e => {
        console.log(e.message);
        process.exit(1);
      });
  }

  async getFile(filename) {
    const file = new S3Key(filename);
    this.plugin.log(`Downloading ${file.getKey()} from bucket...`);

    const params = {
      Bucket: this.bucketName,
      Key: this.keyPath(file.getKey())
    };

    return this.provider.request('S3', 'getObject', params)
      .then((result) => result.Body.toString())
      .catch(() => {
        this.plugin.log(`${filename} does not exists at bucket...`);
        return null;
      });
  }

  async uploadDependencesFile() {
    const { dependenciesPath } = this.plugin.settings;

    this.plugin.log(`Uploading remote ${dependenciesPath}...`);

    const params = {
      Bucket: this.bucketName,
      Key: this.dependenceFilename,
      Body: fs.createReadStream(this.plugin.settings.dependenciesPath)
    };

    return this.provider.request('S3', 'putObject', params)
      .then((result) => {
        this.plugin.log('OK...');
        return result;
      })
      .catch(e => {
        console.log(e.message);
        process.exit(1);
      });
  }

  async downloadDependencesFile() {
    const { dependenciesPath } = this.plugin.settings;
    this.plugin.log(`Downloading ${dependenciesPath} from bucket...`);

    const params = {
      Bucket: this.bucketName,
      Key: this.dependenceFilename
    };

    return this.provider.request('S3', 'getObject', params)
      .then((result) => result.Body.toString())
      .catch(() => {
        this.plugin.log(`${dependenciesPath} does not exists at bucket...`);
        return null;
      });
  }
}

module.exports = UploadService;
