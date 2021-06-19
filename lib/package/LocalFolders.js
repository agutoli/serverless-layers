"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var path = require('path');

var fsExtra = require('fs-extra');

var mkdirp = require('mkdirp');

var _require = require('folder-hash'),
    hashElement = _require.hashElement;

var AbstractService = require('../AbstractService');

var LocalFolders = /*#__PURE__*/function (_AbstractService) {
  (0, _inherits2["default"])(LocalFolders, _AbstractService);

  function LocalFolders() {
    (0, _classCallCheck2["default"])(this, LocalFolders);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(LocalFolders).apply(this, arguments));
  }

  (0, _createClass2["default"])(LocalFolders, [{
    key: "init",
    value: function init() {
      this.layersPackageDir = this.getLayerPackageDir();
      return mkdirp.sync(this.layersPackageDir);
    }
  }, {
    key: "getManifestName",
    value: function getManifestName(hashName) {
      return "__meta__/manifest-localdir-".concat(hashName.toLowerCase(), ".json");
    }
  }, {
    key: "getHash",
    value: function () {
      var _getHash = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var settings, options;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                settings = this.plugin.settings;

                if (settings.localDir) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return");

              case 3:
                options = {
                  folders: settings.localDir.folders,
                  files: settings.localDir.files
                };
                return _context.abrupt("return", hashElement(settings.localDir.path, options));

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getHash() {
        return _getHash.apply(this, arguments);
      }

      return getHash;
    }()
  }, {
    key: "hasFoldersChanges",
    value: function () {
      var _hasFoldersChanges = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _this = this;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", this.getHash().then(function (hash) {
                  var manifest = _this.getManifestName(hash.name);

                  return _this.plugin.bucketService.getFile(manifest).then(function (remoteManifest) {
                    if (remoteManifest === JSON.stringify(hash)) {
                      // not changed
                      return false;
                    }

                    return true;
                  });
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function hasFoldersChanges() {
        return _hasFoldersChanges.apply(this, arguments);
      }

      return hasFoldersChanges;
    }()
  }, {
    key: "copyFolders",
    value: function () {
      var _copyFolders = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        var _this2 = this;

        var settings;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                settings = this.plugin.settings;

                if (settings.localDir) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt("return");

              case 3:
                _context3.next = 5;
                return this.getHash().then(function (hash) {
                  var manifest = _this2.getManifestName(hash.name);

                  var to = path.join(_this2.layersPackageDir, settings.libraryFolder, settings.localDir.name);
                  var from = path.resolve(settings.localDir.path);
                  return fsExtra.copy(from, to).then(function () {
                    return _this2.plugin.bucketService.putFile(manifest, JSON.stringify(hash));
                  });
                });

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function copyFolders() {
        return _copyFolders.apply(this, arguments);
      }

      return copyFolders;
    }()
  }]);
  return LocalFolders;
}(AbstractService);

module.exports = LocalFolders;
//# sourceMappingURL=LocalFolders.js.map