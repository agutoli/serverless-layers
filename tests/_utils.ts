export const mocksInit = {
  serverlessFacade: (opts: any = {}): IServerlessFacade  => {
    return {
      getRuntime: jest.fn(() => opts.runtime),
      awsRequest: jest.fn(),
      getFunctions: jest.fn(),
      attachLayerByArn: jest.fn(),
      getCustomConfigs: jest.fn(() => opts.customConfigs),
      defineCustomProperties: jest.fn(),
      getServerlessVersion: jest.fn(() => opts.serverlessVersion),
      getDeploymentBucketName: jest.fn(() => {
        return opts.deploymentBucketName;
      })
    };
  }
};
