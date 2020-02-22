"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var path = require('path');

var AbstractService = function AbstractService(plugin) {
  (0, _classCallCheck2["default"])(this, AbstractService);
  this.plugin = plugin;
  var runtimeDir = this.plugin.settings.runtimeDir;
  this.stackName = plugin.getStackName();
  this.layerName = plugin.getStackName() + "-".concat(runtimeDir);
  this.bucketName = plugin.getBucketName();
  this.provider = this.plugin.provider;
  this.dependenceFilename = path.join(plugin.getBucketLayersPath(), this.plugin.settings.dependenciesPath);
  this.zipFileKeyName = "".concat(path.join(this.plugin.getBucketLayersPath(), this.stackName), ".zip");

  if (/^win/.test(process.platform)) {
    this.zipFileKeyName = this.zipFileKeyName.replace(/\\/g, '/');
    this.dependenceFilename = this.dependenceFilename.replace(/\\/g, '/');
  }
};

module.exports = AbstractService;
//# sourceMappingURL=AbstractService.js.map