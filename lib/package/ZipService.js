"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var fs = require('fs');

var path = require('path');

var archiver = require('archiver');

var MAX_LAYER_MB_SIZE = 250;

var AbstractService = require('../AbstractService');

var ZipService =
/*#__PURE__*/
function (_AbstractService) {
  (0, _inherits2["default"])(ZipService, _AbstractService);

  function ZipService() {
    (0, _classCallCheck2["default"])(this, ZipService);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ZipService).apply(this, arguments));
  }

  (0, _createClass2["default"])(ZipService, [{
    key: "package",
    value: function _package() {
      var _this = this;

      var zipFileName = this.plugin.getPathZipFileName();
      var layersDir = path.join(process.cwd(), this.plugin.settings.compileDir);
      return new Promise(function (resolve, reject) {
        var oldCwd = process.cwd();
        var output = fs.createWriteStream(zipFileName);
        var zip = archiver.create('zip');
        output.on('close', function () {
          var MB = (zip.pointer() / 1024 / 1024).toFixed(1);

          if (MB > MAX_LAYER_MB_SIZE) {
            _this.plugin.log('Package error!');

            throw new Error('Layers can\'t exceed the unzipped deployment package size limit of 250 MB! \n' + 'Read more: https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html\n\n');
          }

          _this.plugin.log("Created layer package ".concat(zipFileName, " (").concat(MB, " MB)"));

          resolve();
        });
        zip.on('error', function (err) {
          reject(err);
          process.chdir(oldCwd);
        });
        process.chdir(layersDir);
        zip.pipe(output);
        zip.directory('layers', false);
        zip.finalize().then(function () {
          process.chdir(oldCwd);
        });
      });
    }
  }]);
  return ZipService;
}(AbstractService);

module.exports = ZipService;
//# sourceMappingURL=ZipService.js.map