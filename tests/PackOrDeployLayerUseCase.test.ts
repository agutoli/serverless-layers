import {mocksInit} from './_utils';
import {RuntimeResolver} from '../src/core/Runtime';
import {NodeJsRuntimeAdapter} from '../src/runtimes/NodeJsAdapter';
import {LayerConfig} from '../src/core/LayerConfig';
import {State} from '../src/core/State';

jest.mock('../src/usecases/PackOrDeployLayer/ScenarioStaticLayerArnOption');

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
  it('Calls ScenarioStaticLayerArnOption when set "arn" option with static layer arn', async () => {
    const arn = 'arn:aws:lambda:us-east-1:<your_account>:layer:node-v13-11-0:5';
    const v = createInstance({arn});

    await PackOrDeployLayer.UseCase({
      state: v.state,
      facade: v.facade,
      runtime: v.runtime,
      logging: v.logging,
      layerConfig: v.layerConfig
    });

    expect(
      ScenarioStaticLayerArnOption.UseCase
    ).toHaveBeenCalledWith(arn, {facade: v.facade});
  });
});
