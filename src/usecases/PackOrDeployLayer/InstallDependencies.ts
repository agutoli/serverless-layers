import Err from '../../core/errors';

import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

import type Plugin from 'serverless/classes/Plugin';

import {System} from '../../core/System';
import {ZipLayer} from '../../core/ZipLayer';
import {LayerConfig} from '../../core/LayerConfig';

type Injection = {
  runtime: IRuntimeAdapter,
  logging: Plugin.Logging;
  layerConfig: LayerConfig;
};

export async function UseCase({
  runtime,
  layerConfig
}: Injection): Promise<void> {
  const layerPackagePath = layerConfig.layerPackagePath();
  const compileDirAbsPath =  layerConfig.compileDirAbsPath();

  // Creates temp folder to install
  // dependencies and packing it.
  mkdirp.sync(layerPackagePath);

  // List of files to be copied
  const copyBeforeInstall = layerConfig
    .get<Array<string>>('copyBeforeInstall')
    .concat(layerConfig.get<string>('dependenciesPath'));

  for (const filename of copyBeforeInstall) {
    const copyFrom = path.resolve(
      path.join(layerConfig.get<string>('path'), filename)
    );

    const copyTo = path.resolve(
      path.join(layerPackagePath, filename)
    );

    fs.copyFileSync(copyFrom, copyTo);
  }

  // gets installation command based on allowed package manager.
  const packageManager = layerConfig.get<string>('packageManager');
  const installationCommand = runtime.commands[packageManager];

  if (!installationCommand) {
    throw new Err.NotSupported(`The "${packageManager}" value is not supported package manager.`);
  }

  // install packages
  console.log(await System.exec(installationCommand(layerConfig), layerPackagePath));

  const result = await ZipLayer.folder(compileDirAbsPath, {
    output: path.join(compileDirAbsPath, 'example.zip')
  });
  console.log(result);

  // copyBeforeInstall
  // console.log(copyBeforeInstall);

  // layerConfig.get('dependenciesPath')
  // console.log(layerConfig);

  // console.log(layerConfig.dependencyAbsPath());

  // const functions = facade.getFunctions();
  // console.log('before install');
  // // System.exec('');
  // console.log('after install');
}
