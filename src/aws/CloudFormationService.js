const AbstractService = require('../AbstractService');

class CloudFormationService extends AbstractService {
  getOutputs() {
    const params = {
      StackName: this.stackName
    };

    return this.awsRequest('CloudFormation:describeStacks', params)
      .then(({ Stacks }) => Stacks && Stacks[0].Outputs)
      .catch(() => []);
  }
}

module.exports = CloudFormationService;
