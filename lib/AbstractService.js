"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var path = require('path');

var AbstractService = function AbstractService(plugin) {
  (0, _classCallCheck2["default"])(this, AbstractService);
  this.plugin = plugin;
  this.stackName = plugin.getStackName();
  this.bucketName = plugin.getBucketName();
  this.provider = this.plugin.provider;
  this.packageJsonKeyName = path.join(plugin.getBucketLayersPath(), 'package.json');
  this.zipFileKeyName = "".concat(path.join(this.plugin.getBucketLayersPath(), this.stackName), ".zip");

  if (/^win/.test(process.platform)) {
    this.zipFileKeyName = this.zipFileKeyName.replace(/\\/g, '/');
    this.packageJsonKeyName = this.packageJsonKeyName.replace(/\\/g, '/');
  }
};

module.exports = AbstractService;
//# sourceMappingURL=AbstractService.js.map