import {mocksInit} from './_utils';
import {RuntimeResolver} from '../src/core/Runtime';
import {NodeJsRuntimeAdapter} from '../src/runtimes/NodeJsAdapter';
import {LayerConfig} from '../src/core/LayerConfig';
import {State} from '../src/core/State';

jest.mock('../src/usecases/PackOrDeployLayer/AddLayerToServerless');

import * as AddLayerToServerless from '../src/usecases/PackOrDeployLayer/AddLayerToServerless';
import * as PackOrDeployLayer from '../src/usecases/PackOrDeployLayer';

const createInstance = (opts = {}) => {
  let facade = mocksInit.serverlessFacade({
    runtime: "nodejs14.x"
  });

  let layerConfig = new LayerConfig('myLayerName', {
    compileDir: '.',
    libraryFolder: '',
    dependenciesPath: '',
    packageManager: 'npm',
    compatibleRuntimes: [],
    compatibleArchitectures: [],
    ...opts
  });
  let state = new State(facade, layerConfig);
  let resolver = new RuntimeResolver(facade);
  resolver.registerAdapter(new NodeJsRuntimeAdapter);
  let runtime = resolver.resolve();

  return {
    facade,
    layerConfig,
    state,
    resolver,
    runtime
  }
}

describe('PackOrDeployLayer', () => {
  it('Returns static layer arn straightway when set "arn" option', async () => {
    let arn = 'arn:aws:lambda:us-east-1:<your_account>:layer:node-v13-11-0:5';
    let v = createInstance({arn});

    await PackOrDeployLayer.UseCase({
      state: v.state,
      facade: v.facade,
      runtime: v.runtime,
      layerConfig: v.layerConfig
    });

    expect(AddLayerToServerless.UseCase).toHaveBeenCalledWith(arn, {facade: v.facade});
  });
});
