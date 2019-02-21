const fs = require('fs');
const AbstractService = require('../AbstractService');

class UploadService extends AbstractService {
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

  async uploadPackageJson() {
    this.plugin.log('Uploading remote package.json...');

    const params = {
      Bucket: this.bucketName,
      Key: this.packageJsonKeyName,
      Body: fs.createReadStream(this.plugin.settings.packagePath)
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

  async downloadPackageJson() {
    this.plugin.log('Downloading package.json from bucket...');

    const params = {
      Bucket: this.bucketName,
      Key: this.packageJsonKeyName
    };

    return this.provider.request('S3', 'getObject', params)
      .then((result) => JSON.parse(result.Body.toString()))
      .catch(() => {
        this.plugin.log('package.json does not exists at bucket...');
        return null;
      });
  }
}

module.exports = UploadService;
