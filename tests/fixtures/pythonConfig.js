module.exports = {
  runtimeDir: 'python',
  libraryFolder: 'site-packages',
  packageManager:  'pip',
  packageManagerExtraArgs: '',
  dependenciesPath: 'requirements.txt',
  compatibleRuntimes: ["python3.8"],
  copyBeforeInstall: [],
  packageExclude: [
    'package.json',
    'package-lock.json',
    'node_modules/**',
  ]
}

