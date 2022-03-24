module.exports = {
  runtime: 'nodejs12.x',
  runtimeDir: 'nodejs',
  packageManager: 'yarn',
  libraryFolder: 'node_modules',
  dependenciesPath: './fixtures/package.json',
  dependenciesLockPath: 'yarn.lock',
  compatibleRuntimes: [ 'nodejs' ],
  copyBeforeInstall: [ '.npmrc', 'yarn.lock', 'package-lock.json' ],
  packageExclude: [ 'node_modules/**' ]
}
