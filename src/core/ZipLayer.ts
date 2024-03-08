import Err from './errors';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import fastFolderSizeSync from 'fast-folder-size/sync';

// 1MB in bytes (KiB)
// @see https://en.wikipedia.org/wiki/Binary_prefix
const MB = 1024 ** 2;

// /**
//  * 50 MB (zipped, for direct upload)
//  * @see https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
//  */
// const DEPLOYMENT_PACKAGE_KB_ZIPPED = 50 * MB;

/**
 * 250 MB (unzipped)
 * This quota applies to all the files you upload,
 * including layers and custom runtimes.
 * @see https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
 */
const DEPLOYMENT_PACKAGE_KB_UNZIPPED = 250 * MB;

/**
 * Converts from decimal (kB) to binary prefix (KiB).
 */
export const folderSize = async (pathdir: string): Promise<number> => {
  const decimalBytes: number = 1000 ** 2;
  const binaryPrefixBytes: number = 1024 ** 2;
  const decimal = fastFolderSizeSync(pathdir) as number;

   // converts size to binary prefix
  return Math.round((decimal / decimalBytes) * binaryPrefixBytes);
};

type ZipLayerOpts = {
  output: string;
};

export class ZipLayer {
  static async folder(pathdir: string, opts: ZipLayerOpts): Promise<string> {
    if (!fs.existsSync(pathdir)) {
      throw new Err.InvalidLayerPackage(
        `Could not find "${pathdir}" path.`
      );
    }

    const size = await folderSize(pathdir);

    if (size > DEPLOYMENT_PACKAGE_KB_UNZIPPED) {
      const unzippedMB = DEPLOYMENT_PACKAGE_KB_UNZIPPED / MB;
      throw new Err.UnzippedLayerSize(
        `Unzipped size must be smaller than "${DEPLOYMENT_PACKAGE_KB_UNZIPPED}" bytes (${unzippedMB}MB).`
      );
    }

    const layersFolderPath = path.join(pathdir, 'layers');
    if (!fs.existsSync(layersFolderPath)) {
      throw new Err.InvalidLayerPackage(
        `Could not find "${layersFolderPath}" path.`
      );
    }

    // creates folder if not exists
    const outputDir = path.dirname(opts.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true});
    }

    // creates zip instance
    const zip = archiver.create('zip');

    // creates temp stream
    const outputStream = fs.createWriteStream(opts.output);

    // stores the current cwd path.
    const currentCwd = process.cwd();

    // change dir to layers folder
    process.chdir(pathdir);

    zip.pipe(outputStream);

    zip.directory('layers', false);

    return new Promise((resolve, reject) => {
      outputStream.on('close', () => {
        resolve(opts.output);
      });

      zip.on('error', (err) => {
        reject(err);
        process.chdir(currentCwd);
      });

      zip.finalize().then(() => {
        process.chdir(currentCwd);
      });
    });
  }
}
