"use strict";

module.exports = function (sls) {
  var version = sls.getVersion();
  var versionNum = version.replace(/\./g, '');

  if (versionNum < 1340) {
    this.log("Error: Please install serverless >= 1.34.0 (current ".concat(version, ")"));
    process.exit(1);
  }
};
//# sourceMappingURL=checkRequirements.js.map