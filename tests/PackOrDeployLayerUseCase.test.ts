import {mocksInit} from './_utils';
import {RuntimeResolver} from '../src/core/Runtime';
import {NodeJsRuntimeAdapter} from '../src/runtimes/NodeJsAdapter';
import {LayerConfig} from '../src/core/LayerConfig';
import {State} from '../src/core/State';

jest.mock('../src/usecases/PackOrDeployLayer/OptimizeBeforePack');
jest.mock('../src/usecases/PackOrDeployLayer/ScenarioStaticLayerArnOption');

import * as OptimizeBeforePack from '../src/usecases/PackOrDeployLayer/OptimizeBeforePack';
import * as ScenarioStaticLayerArnOption from '../src/usecases/PackOrDeployLayer/ScenarioStaticLayerArnOption';
import * as PackOrDeployLayer from '../src/usecases/PackOrDeployLayer';

const createInstance = (opts = {}) => {
  const runtimeId = 'nodejs14.x';
  const logging = mocksInit.createLoggingMock();
  const facade = mocksInit.serverlessFacade({runtime: runtimeId});

  const layerConfig = new LayerConfig('myLayerName', {
    path: '.',
    runtimeDir: '.',
    runtime: runtimeId,
    compileDir: '.',
    layerConfigKey: 'myLayerName',
    libraryFolder: '',
    dependenciesPath: '',
    packageManager: 'npm',
    compatibleRuntimes: [],
    copyAfterInstall: [],
    copyBeforeInstall: [],
    compatibleArchitectures: [],
    ...opts
  });
  const state = new State(facade, layerConfig);
  const resolver = new RuntimeResolver(facade);
  resolver.registerAdapter(new NodeJsRuntimeAdapter);
  const runtime = resolver.resolve();

  return {
    logging,
    facade,
    layerConfig,
    state,
    resolver,
    runtime
  }
}

describe('PackOrDeployLayer', () => {
  let arn: any;
  let instance: any;

  beforeEach(async () => {
    arn = 'arn:aws:lambda:us-east-1:<your_account>:layer:node-v13-11-0:5';
    instance = createInstance({arn});

    await PackOrDeployLayer.UseCase({
      state: instance.state,
      facade: instance.facade,
      runtime: instance.runtime,
      logging: instance.logging,
      layerConfig: instance.layerConfig
    });
  });

  it('Must call OptimizeBeforePack always', async () => {
    expect(
      OptimizeBeforePack.UseCase
    ).toHaveBeenCalledWith({
      facade: instance.facade,
      logging: instance.logging,
      layerConfig: instance.layerConfig,
    });
  });

  it('Calls ScenarioStaticLayerArnOption when set "arn" option with static layer arn', async () => {
    expect(
      ScenarioStaticLayerArnOption.UseCase
    ).toHaveBeenCalledWith(arn, {facade: instance.facade});
  });
});
