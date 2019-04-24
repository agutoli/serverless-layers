"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var fs = require('fs');

var AbstractService = require('../AbstractService');

var UploadService =
/*#__PURE__*/
function (_AbstractService) {
  (0, _inherits2["default"])(UploadService, _AbstractService);

  function UploadService() {
    (0, _classCallCheck2["default"])(this, UploadService);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(UploadService).apply(this, arguments));
  }

  (0, _createClass2["default"])(UploadService, [{
    key: "uploadZipFile",
    value: function () {
      var _uploadZipFile = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var _this = this;

        var params;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.plugin.log('Uploading layer package...');
                params = {
                  Bucket: this.bucketName,
                  Key: this.zipFileKeyName,
                  Body: fs.createReadStream(this.plugin.getPathZipFileName())
                };
                return _context.abrupt("return", this.provider.request('S3', 'putObject', params).then(function (result) {
                  _this.plugin.log('OK...');

                  return result;
                })["catch"](function (e) {
                  console.log(e.message);
                  process.exit(1);
                }));

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function uploadZipFile() {
        return _uploadZipFile.apply(this, arguments);
      }

      return uploadZipFile;
    }()
  }, {
    key: "uploadPackageJson",
    value: function () {
      var _uploadPackageJson = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2() {
        var _this2 = this;

        var params;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.plugin.log('Uploading remote package.json...');
                params = {
                  Bucket: this.bucketName,
                  Key: this.packageJsonKeyName,
                  Body: fs.createReadStream(this.plugin.settings.packagePath)
                };
                return _context2.abrupt("return", this.provider.request('S3', 'putObject', params).then(function (result) {
                  _this2.plugin.log('OK...');

                  return result;
                })["catch"](function (e) {
                  console.log(e.message);
                  process.exit(1);
                }));

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function uploadPackageJson() {
        return _uploadPackageJson.apply(this, arguments);
      }

      return uploadPackageJson;
    }()
  }, {
    key: "downloadPackageJson",
    value: function () {
      var _downloadPackageJson = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3() {
        var _this3 = this;

        var params;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.plugin.log('Downloading package.json from bucket...');
                params = {
                  Bucket: this.bucketName,
                  Key: this.packageJsonKeyName
                };
                return _context3.abrupt("return", this.provider.request('S3', 'getObject', params).then(function (result) {
                  return JSON.parse(result.Body.toString());
                })["catch"](function () {
                  _this3.plugin.log('package.json does not exists at bucket...');

                  return null;
                }));

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function downloadPackageJson() {
        return _downloadPackageJson.apply(this, arguments);
      }

      return downloadPackageJson;
    }()
  }]);
  return UploadService;
}(AbstractService);

module.exports = UploadService;
//# sourceMappingURL=BucketService.js.map