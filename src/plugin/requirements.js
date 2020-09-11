module.exports = function(sls) {
  const version = sls.getVersion();
  const versionNum = version.replace(/\./g, '');

  if (versionNum < 1340) {
    this.log(`Error: Please install serverless >= 1.34.0 (current ${version})`)
    process.exit(1);
  }
}
