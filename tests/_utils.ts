import type Plugin from 'serverless/classes/Plugin';

export const mocksInit = {
  createLoggingMock: (): Plugin.Logging  => {
    const createProgress = (name: any) => {
      return {
        name,
        namespace: 'some-process-ns',
        update: jest.fn(),
        info: jest.fn(),
        notice: jest.fn(),
        remove: jest.fn()
      }
    };

    return {
      log: {
        error: jest.fn(),
        warning: jest.fn(),
        notice: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
        success: jest.fn(),
      },
      writeText: jest.fn(),
      progress: {
        get: (name: string) => createProgress(name),
        create: (args: {message?: string, name?: string}) => createProgress(args.name)
      }
    };
  },
  serverlessFacade: (opts: any = {}): IServerlessFacade  => {
    return {
      getRuntime: jest.fn(() => opts.runtime),
      awsRequest: jest.fn(),
      getOptions: jest.fn(),
      getFunctions: jest.fn(),
      attachLayerByArn: jest.fn(),
      getCustomConfigs: jest.fn(() => opts.customConfigs || []),
      defineCustomProperties: jest.fn(),
      getServerlessVersion: jest.fn(() => opts.serverlessVersion),
      getDeploymentBucketName: jest.fn(() => {
        return opts.deploymentBucketName;
      })
    };
  }
};
