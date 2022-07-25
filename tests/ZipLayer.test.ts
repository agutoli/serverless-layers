import Err from '../src/core/errors';
import fs from 'fs-extra';
import path from 'path';
import {mocksInit} from './_utils';
import {ZipLayer} from '../src/core/ZipLayer';
import fastFolderSizeSync from 'fast-folder-size/sync';

jest.mock('fast-folder-size/sync');

describe('ZipLayer', () => {
  let outputDir: string = '/tmp/zip-layer-test/';

  afterEach(() => {
    // reset mock
    (fastFolderSizeSync as any).mockImplementation(() => 0);
    try {
      // cleanup created folder
      fs.removeSync(outputDir);
    } catch(e) {}
  });

  it('creates zip package', async () => {
    const layerDir = "./tests/fixtures/zip-layer-test";
    const output = path.join(outputDir, `test-${new Date().getTime()}.zip`);
    const result = await ZipLayer.folder(layerDir, {output});
    expect(fs.existsSync(output)).toBe(true);
  });

  it('throws "UnzippedLayerSize" when folder bigger than 250MB', () => {
    const bytesLimit = 262144000;
    (fastFolderSizeSync as any).mockImplementation(() => bytesLimit + 1);

    const layerDir = "./tests/fixtures/zip-layer-test";
    const output = path.join(outputDir, "a.zip");

    const calls = async () => {
      await ZipLayer.folder(layerDir, {output});
    };

    expect(calls).rejects.toThrow(Err.UnzippedLayerSize);
  });

  it('throws "InvalidLayerPackage" when invalid layer path', () => {
    const layerDir = "./tests/fixtures/no-exists-folder";
    const output = path.join(outputDir, `a.zip`);

    const calls = async () => {
      await ZipLayer.folder(layerDir, {output});
    };

    expect(calls).rejects.toThrow(Err.InvalidLayerPackage);
  });

  it('throws "InvalidLayerPackage" when no "layers" folder found', () => {
    const layerDir = "./tests/fixtures/zip-layer-invalid";
    const output = path.join(outputDir, `a.zip`);

    const calls = async () => {
      await ZipLayer.folder(layerDir, {output});
    };

    expect(calls).rejects.toThrow(Err.InvalidLayerPackage);
  });
});
