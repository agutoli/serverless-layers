module.exports = {
  runtime: 'nodejs12.x',
  runtimeDir: 'nodejs',
  packageManager: 'yarn',
  packageManagerExtraArgs: '',
  libraryFolder: 'node_modules',
  dependenciesPath: './fixtures/package.json',
  compatibleRuntimes: [ 'nodejs' ],
  copyBeforeInstall: [ '.npmrc', 'yarn.lock', 'package-lock.json' ],
  packageExclude: [ 'node_modules/**' ]
}
