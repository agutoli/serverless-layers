module.exports = {
  runtime: 'nodejs12.x',
  runtimeDir: 'nodejs',
  packageManager: 'yarn',
  packageManagerExtraArgs: '',
  libraryFolder: 'node_modules',
  dependenciesPath: './fixtures/package.json',
  layerOptimization: {
    cleanupPatterns: [
      "node_modules/aws-sdk/**",
      "node_modules/**/.github",
      "node_modules/**/.git/*",
      "node_modules/**/.lint",
      "node_modules/**/Gruntfile.js",
      "node_modules/**/.jshintrc",
      "node_modules/**/.nycrc",
      "node_modules/**/.nvmrc",
      "node_modules/**/.editorconfig",
      "node_modules/**/.npmignore",
      "node_modules/**/bower.json",
      "node_modules/**/.eslint*",
      "node_modules/**/.gitignore",
      "node_modules/**/README.*",
      "node_modules/**/LICENSE",
      "node_modules/**/LICENSE.md",
      "node_modules/**/CHANGES",
      "node_modules/**/HISTORY.md",
      "node_modules/**/CHANGES.md",
      "node_modules/**/CHANGELOG.md",
      "node_modules/**/sponsors.md",
      "node_modules/**/license.txt",
      "node_modules/**/tsconfig.json",
      "node_modules/**/*.test.js",
      "node_modules/**/*.spec.js",
      "node_modules/**/.travis.y*ml",
      "node_modules/**/yarn.lock",
      "node_modules/**/.package-lock.json",
      "node_modules/**/*.md"
    ]
  },
  compatibleRuntimes: [ 'nodejs' ],
  compatibleArchitectures: [
    "x86_64",
    "arm64"
  ],
  copyBeforeInstall: [ '.npmrc', 'yarn.lock', 'package-lock.json' ],
  packagePatterns: [ '!node_modules/**' ]
}
