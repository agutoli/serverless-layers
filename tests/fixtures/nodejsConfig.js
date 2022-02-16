module.exports = {
  runtime: 'nodejs12.x',
  runtimeDir: 'nodejs',
  packageManager: 'yarn',
  packageManagerExtraArgs: '',
  libraryFolder: 'node_modules',
  dependenciesPath: './fixtures/package.json',
  compatibleRuntimes: [ 'nodejs' ],
  compatibleArchitectures: [
    "x86_64",
    "arm64"
  ],
  copyBeforeInstall: [ '.npmrc', 'yarn.lock', 'package-lock.json' ],
  packageExclude: [ 'node_modules/**' ]
}
