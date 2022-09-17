import Err from '../../core/errors';

import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import mkdirp from 'mkdirp';
import glob from 'glob';

import strip from 'strip-comments';
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
  logging,
  layerConfig
}: Injection): Promise<void> {
  const layerPackagePath = layerConfig.layerPackagePath();
  const compileDirAbsPath = layerConfig.compileDirAbsPath();

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

    if (fs.existsSync(copyFrom)) {
      fs.copyFileSync(copyFrom, copyTo);
    } else {
      logging.log.warning(`copyBeforeInstall: File "${copyFrom} not found.`);
    }
  }

  // gets installation command based on allowed package manager.
  const packageManager = layerConfig.get<string>('packageManager');
  const installationCommand = runtime.commands[packageManager];

  if (!installationCommand) {
    throw new Err.NotSupported(`The "${packageManager}" value is not supported package manager.`);
  }

  // install packages
  console.log(await System.exec(installationCommand(layerConfig), layerPackagePath));

  const {cleanupPatterns} = layerConfig.optimization;



  for (const cleanupPattern of cleanupPatterns) {
    const filesToRemove = await new Promise((resolve, reject) => {
      glob(path.join(layerPackagePath, cleanupPattern), {}, (err, files) => {
        if (err) return reject(err);
        resolve(files);
      });
    }) as Array<string>;
    for (const filename of filesToRemove) {
      try {
        // logging.log.notice('removing:', filename);
        fs.rmSync(filename, { recursive: true, force: true });
      } catch (e) {
        fsExtra.removeSync(filename);
      }
    }
  }

  console.log(strip);

  // remove comments
  // glob(path.join(layerPackagePath, "**/*.*"), {}, (err, files) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }

  //   files.forEach((filename) => {
  //     const language = path.extname(filename).replace('.', '');
  //     try {
  //       const source = fs.readFileSync(filename, {
  //         encoding:'utf8',
  //         flag:'r'
  //       });
  //       const str = strip(source, {language});
  //       fs.writeFileSync(filename, str)
  //     } catch (e) {
  //       // console.log(filename, e);
  //     }
  //   });
  // });

  const output = layerConfig.layerArtifactPath();
  await ZipLayer.folder(compileDirAbsPath, {output});
}
