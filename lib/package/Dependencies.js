"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var fs = require('fs');

var chalk = require('chalk');

var fsExtra = require('fs-extra');

var glob = require('glob');

var path = require('path');

var mkdirp = require('mkdirp');

var _require = require('child_process'),
    execSync = _require.execSync;

var copyFile = require('fs-copy-file'); // node v6.10.3 support


var AbstractService = require('../AbstractService');

function resolveFile(from) {
  return new Promise(function (resolve, reject) {
    glob(from, {}, function (err, files) {
      if (err) return reject();
      return resolve(files);
    });
  });
}

var Dependencies = /*#__PURE__*/function (_AbstractService) {
  (0, _inherits2["default"])(Dependencies, _AbstractService);

  function Dependencies() {
    (0, _classCallCheck2["default"])(this, Dependencies);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Dependencies).apply(this, arguments));
  }

  (0, _createClass2["default"])(Dependencies, [{
    key: "init",
    value: function init() {
      this.layersPackageDir = this.getLayerPackageDir();
      return mkdirp.sync(this.layersPackageDir);
    }
  }, {
    key: "getDepsPath",
    value: function getDepsPath() {
      var settings = this.plugin.settings;
      var rooPath = path.join(settings.path, settings.dependenciesPath);
      return path.resolve(rooPath);
    }
  }, {
    key: "run",
    value: function () {
      var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(cmd) {
        var output;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.plugin.slsLayersConfig.shouldNotInstallPackages) {
                  _context.next = 4;
                  break;
                }

                console.log('[ LayersPlugin ]: installing packages');
                output = execSync(cmd, {
                  cwd: this.layersPackageDir,
                  env: process.env,
                  maxBuffer: 1024 * 1024 * 500
                }).toString();
                return _context.abrupt("return", output);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function run(_x) {
        return _run.apply(this, arguments);
      }

      return run;
    }()
  }, {
    key: "copyProjectFile",
    value: function copyProjectFile(filePath) {
      var _this = this;

      var fileName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      this.init();

      if (!fs.existsSync(filePath)) {
        this.plugin.warn("[warning] \"".concat(filePath, "\" file does not exists!"));
        return true;
      }

      return new Promise(function (resolve) {
        var destFile = path.join(_this.layersPackageDir, fileName || path.basename(filePath));
        copyFile(filePath, destFile, function (copyErr) {
          if (copyErr) throw copyErr;
          return resolve();
        });
      });
    }
  }, {
    key: "install",
    value: function () {
      var _install = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _this$plugin$settings, copyBeforeInstall, copyAfterInstall, renameFilename, index, filename, commands, _index, pathTo, pathFrom, _yield$resolveFile, _yield$resolveFile2, from, to;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this$plugin$settings = this.plugin.settings, copyBeforeInstall = _this$plugin$settings.copyBeforeInstall, copyAfterInstall = _this$plugin$settings.copyAfterInstall;
                this.init();
                this.plugin.log("".concat(chalk.inverse.yellow(' Changes identified '), "! Re-installing..."));
                /**
                 * This is necessary because npm is
                 * not possible to specify a custom
                 * name for package.json.
                 */

                renameFilename = null;

                if (this.plugin.settings.runtimeDir === 'nodejs') {
                  renameFilename = 'package.json';
                }

                _context2.next = 7;
                return this.copyProjectFile(this.getDepsPath(), renameFilename);

              case 7:
                _context2.t0 = _regenerator["default"].keys(copyBeforeInstall);

              case 8:
                if ((_context2.t1 = _context2.t0()).done) {
                  _context2.next = 15;
                  break;
                }

                index = _context2.t1.value;
                filename = copyBeforeInstall[index];
                _context2.next = 13;
                return this.copyProjectFile(filename);

              case 13:
                _context2.next = 8;
                break;

              case 15:
                if (!this.plugin.settings.customInstallationCommand) {
                  _context2.next = 25;
                  break;
                }

                _context2.t2 = console;
                _context2.t3 = chalk;
                _context2.next = 20;
                return this.run(this.plugin.settings.customInstallationCommand);

              case 20:
                _context2.t4 = _context2.sent;
                _context2.t5 = _context2.t3.white.call(_context2.t3, _context2.t4);

                _context2.t2.log.call(_context2.t2, _context2.t5);

                _context2.next = 33;
                break;

              case 25:
                commands = this.plugin.runtimes.getCommands();
                _context2.t6 = console;
                _context2.t7 = chalk;
                _context2.next = 30;
                return this.run(commands[this.plugin.settings.packageManager]);

              case 30:
                _context2.t8 = _context2.sent;
                _context2.t9 = _context2.t7.white.call(_context2.t7, _context2.t8);

                _context2.t6.log.call(_context2.t6, _context2.t9);

              case 33:
                _context2.t10 = _regenerator["default"].keys(copyAfterInstall);

              case 34:
                if ((_context2.t11 = _context2.t10()).done) {
                  _context2.next = 54;
                  break;
                }

                _index = _context2.t11.value;
                pathTo = copyAfterInstall[_index].to;
                pathFrom = copyAfterInstall[_index].from;
                _context2.next = 40;
                return resolveFile(path.join(this.layersPackageDir, pathFrom));

              case 40:
                _yield$resolveFile = _context2.sent;
                _yield$resolveFile2 = (0, _slicedToArray2["default"])(_yield$resolveFile, 1);
                from = _yield$resolveFile2[0];
                to = path.join(this.layersPackageDir, pathTo);
                _context2.prev = 44;
                _context2.next = 47;
                return fsExtra.copy(from, to);

              case 47:
                _context2.next = 52;
                break;

              case 49:
                _context2.prev = 49;
                _context2.t12 = _context2["catch"](44);
                console.log(_context2.t12);

              case 52:
                _context2.next = 34;
                break;

              case 54:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[44, 49]]);
      }));

      function install() {
        return _install.apply(this, arguments);
      }

      return install;
    }()
  }]);
  return Dependencies;
}(AbstractService);

module.exports = Dependencies;
//# sourceMappingURL=Dependencies.js.map