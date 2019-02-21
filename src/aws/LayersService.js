const AbstractService = require('../AbstractService');

class LayersService extends AbstractService {
  async publishVersion() {
    const params = {
      Content: {
        S3Bucket: this.bucketName,
        S3Key: this.zipFileKeyName
      },
      LayerName: this.stackName,
      Description: 'created by serverless-layers',
      CompatibleRuntimes: ['nodejs']
    };

    return this.provider.request('Lambda', 'publishLayerVersion', params)
      .then((result) => {
        this.plugin.log('New layer version published...');
        this.plugin.cacheObject.LayerVersionArn = result.LayerVersionArn;
        return result;
      })
      .catch(e => {
        console.log(e.message);
        process.exit(1);
      });
  }
}

module.exports = LayersService;
