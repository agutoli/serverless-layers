"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var path = require('path');

var AbstractService = /*#__PURE__*/function () {
  function AbstractService(plugin) {
    (0, _classCallCheck2["default"])(this, AbstractService);
    this.plugin = plugin;
    this.functionName = plugin.currentLayerName;
    this.stackName = plugin.getStackName();
    this.layerName = plugin.getLayerName();
    this.bucketName = plugin.getBucketName();
    this.provider = this.plugin.provider;
    this.dependenceFilename = path.join(plugin.getBucketLayersPath(), this.plugin.settings.dependenciesPath);
    this.zipFileKeyName = "".concat(path.join(this.plugin.getBucketLayersPath(), this.layerName), ".zip");

    if (/^win/.test(process.platform)) {
      this.zipFileKeyName = this.zipFileKeyName.replace(/\\/g, '/');
      this.dependenceFilename = this.dependenceFilename.replace(/\\/g, '/');
    }
  }

  (0, _createClass2["default"])(AbstractService, [{
    key: "getLayerPackageDir",
    value: function getLayerPackageDir() {
      var _this$plugin$settings = this.plugin.settings,
          compileDir = _this$plugin$settings.compileDir,
          runtimeDir = _this$plugin$settings.runtimeDir;
      return path.join(process.cwd(), compileDir, 'layers', runtimeDir);
      ;
    }
  }]);
  return AbstractService;
}();

module.exports = AbstractService;
//# sourceMappingURL=AbstractService.js.map