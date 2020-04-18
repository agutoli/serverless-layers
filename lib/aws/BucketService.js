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

var path = require('path');

var S3Key = require('./S3Key');

var AbstractService = require('../AbstractService');

var UploadService = /*#__PURE__*/function (_AbstractService) {
  (0, _inherits2["default"])(UploadService, _AbstractService);

  function UploadService() {
    (0, _classCallCheck2["default"])(this, UploadService);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(UploadService).apply(this, arguments));
  }

  (0, _createClass2["default"])(UploadService, [{
    key: "keyPath",
    value: function keyPath(filename) {
      var value = path.join(this.plugin.getBucketLayersPath(), filename);

      if (/^win/.test(process.platform)) {
        value = value.replace(/\\/g, '/');
      }

      return value;
    }
  }, {
    key: "uploadZipFile",
    value: function () {
      var _uploadZipFile = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
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
    key: "putFile",
    value: function () {
      var _putFile = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(filename, body) {
        var _this2 = this;

        var file, Body, params;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                file = new S3Key(filename);
                this.plugin.log("Uploading remote ".concat(filename, "..."));
                Body = body;

                if (!body) {
                  Body = file.getStream();
                }

                params = {
                  Body: Body,
                  Bucket: this.bucketName,
                  Key: this.keyPath(file.getKey())
                };
                return _context2.abrupt("return", this.provider.request('S3', 'putObject', params).then(function (result) {
                  _this2.plugin.log('OK...');

                  return result;
                })["catch"](function (e) {
                  console.log(e.message);
                  process.exit(1);
                }));

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function putFile(_x, _x2) {
        return _putFile.apply(this, arguments);
      }

      return putFile;
    }()
  }, {
    key: "getFile",
    value: function () {
      var _getFile = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(filename) {
        var _this3 = this;

        var file, params;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                file = new S3Key(filename);
                this.plugin.log("Downloading ".concat(file.getKey(), " from bucket..."));
                params = {
                  Bucket: this.bucketName,
                  Key: this.keyPath(file.getKey())
                };
                return _context3.abrupt("return", this.provider.request('S3', 'getObject', params).then(function (result) {
                  return result.Body.toString();
                })["catch"](function () {
                  _this3.plugin.log("".concat(filename, " does not exists at bucket..."));

                  return null;
                }));

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getFile(_x3) {
        return _getFile.apply(this, arguments);
      }

      return getFile;
    }()
  }, {
    key: "uploadDependencesFile",
    value: function () {
      var _uploadDependencesFile = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        var _this4 = this;

        var dependenciesPath, params;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                dependenciesPath = this.plugin.settings.dependenciesPath;
                this.plugin.log("Uploading remote ".concat(dependenciesPath, "..."));
                params = {
                  Bucket: this.bucketName,
                  Key: this.dependenceFilename,
                  Body: fs.createReadStream(this.plugin.settings.dependenciesPath)
                };
                return _context4.abrupt("return", this.provider.request('S3', 'putObject', params).then(function (result) {
                  _this4.plugin.log('OK...');

                  return result;
                })["catch"](function (e) {
                  console.log(e.message);
                  process.exit(1);
                }));

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function uploadDependencesFile() {
        return _uploadDependencesFile.apply(this, arguments);
      }

      return uploadDependencesFile;
    }()
  }, {
    key: "downloadDependencesFile",
    value: function () {
      var _downloadDependencesFile = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
        var _this5 = this;

        var dependenciesPath, params;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                dependenciesPath = this.plugin.settings.dependenciesPath;
                this.plugin.log("Downloading ".concat(dependenciesPath, " from bucket..."));
                params = {
                  Bucket: this.bucketName,
                  Key: this.dependenceFilename
                };
                return _context5.abrupt("return", this.provider.request('S3', 'getObject', params).then(function (result) {
                  return result.Body.toString();
                })["catch"](function () {
                  _this5.plugin.log("".concat(dependenciesPath, " does not exists at bucket..."));

                  return null;
                }));

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function downloadDependencesFile() {
        return _downloadDependencesFile.apply(this, arguments);
      }

      return downloadDependencesFile;
    }()
  }]);
  return UploadService;
}(AbstractService);

module.exports = UploadService;
//# sourceMappingURL=BucketService.js.map