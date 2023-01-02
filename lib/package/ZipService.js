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

var chalk = require('chalk');

var mkdirp = require('mkdirp');

var crypto = require('crypto');

var fsExtra = require('fs-extra');

var archiver = require('archiver');

var MAX_LAYER_MB_SIZE = 250;

var AbstractService = require('../AbstractService');

var ZipService = /*#__PURE__*/function (_AbstractService) {
  (0, _inherits2["default"])(ZipService, _AbstractService);

  function ZipService() {
    (0, _classCallCheck2["default"])(this, ZipService);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ZipService).apply(this, arguments));
  }

  (0, _createClass2["default"])(ZipService, [{
    key: "getManifestName",
    value: function getManifestName(hashName) {
      return "__meta__/manifest-zip-artifact__".concat(this.functionName, ".json");
    }
  }, {
    key: "getChecksum",
    value: function getChecksum(path) {
      return new Promise(function (resolve, reject) {
        var hash = crypto.createHash('md5');
        var input = fs.createReadStream(path);
        input.on('error', reject);
        input.on('data', function (chunk) {
          hash.update(chunk);
        });
        input.on('close', function () {
          resolve(hash.digest('hex'));
        });
      });
    }
  }, {
    key: "hasZipChanged",
    value: function () {
      var _hasZipChanged = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var artifact, mName, currentChecksum, remoteChecksum;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                artifact = this.plugin.settings.artifact;
                mName = this.getManifestName(artifact);
                _context.next = 4;
                return this.getChecksum(artifact);

              case 4:
                currentChecksum = _context.sent;
                _context.next = 7;
                return this.plugin.bucketService.getFile(mName);

              case 7:
                remoteChecksum = _context.sent;

                if (!(remoteChecksum === currentChecksum)) {
                  _context.next = 10;
                  break;
                }

                return _context.abrupt("return", false);

              case 10:
                // It updates remote check sum
                this.plugin.log("".concat(chalk.inverse.yellow(' Artifact changed '), "! Checksum=").concat(currentChecksum));
                _context.next = 13;
                return this.plugin.bucketService.putFile(mName, currentChecksum);

              case 13:
                return _context.abrupt("return", true);

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function hasZipChanged() {
        return _hasZipChanged.apply(this, arguments);
      }

      return hasZipChanged;
    }()
  }, {
    key: "package",
    value: function _package() {
      var _this = this;

      var zipFileName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.plugin.getPathZipFileName();
      var _this$plugin$settings = this.plugin.settings,
          compileDir = _this$plugin$settings.compileDir,
          artifact = _this$plugin$settings.artifact,
          libraryFolder = _this$plugin$settings.libraryFolder,
          runtimeDir = _this$plugin$settings.runtimeDir;
      var layersDir = path.join(process.cwd(), compileDir);
      var shouldZipExternalLibraries = this.plugin.slsLayersConfig.shouldNotInstallPackages;
      var externalLibrariesFolder = path.join(process.cwd(), libraryFolder);
      return new Promise(function (resolve, reject) {
        // it's a zip already
        if (artifact) {
          // It checks if file exists
          if (!fs.existsSync(zipFileName)) {
            throw Error("Artifact not found \"".concat(zipFileName, "\"."));
          }

          return resolve();
        }

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

        if (shouldZipExternalLibraries) {
          console.log("[ LayersPlugin ]: external libraries should be zipped, externalLibrariesFolder - ".concat(externalLibrariesFolder, ", runtimeDir - ").concat(runtimeDir, ", ").concat(libraryFolder));
          zip.directory(externalLibrariesFolder, path.join(runtimeDir, libraryFolder));
        }

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