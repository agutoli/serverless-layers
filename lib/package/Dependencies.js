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

var Dependencies =
/*#__PURE__*/
function (_AbstractService) {
  (0, _inherits2["default"])(Dependencies, _AbstractService);

  function Dependencies() {
    (0, _classCallCheck2["default"])(this, Dependencies);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Dependencies).apply(this, arguments));
  }

  (0, _createClass2["default"])(Dependencies, [{
    key: "init",
    value: function init() {
      var runtimeDir = this.plugin.settings.runtimeDir;
      this.layersPackageDir = path.join(process.cwd(), this.plugin.settings.compileDir, 'layers', runtimeDir);
    }
  }, {
    key: "run",
    value: function () {
      var _run = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(cmd) {
        var output;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                output = execSync(cmd, {
                  cwd: this.layersPackageDir,
                  env: process.env
                }).toString();
                return _context.abrupt("return", output);

              case 2:
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
    value: function copyProjectFile(filename) {
      var _this = this;

      this.init();

      if (!fs.existsSync(filename)) {
        this.plugin.warn("[warning] \"".concat(filename, "\" file does not exists!"));
        return true;
      }

      return new Promise(function (resolve) {
        copyFile(filename, path.join(_this.layersPackageDir, filename), function (copyErr) {
          if (copyErr) throw copyErr;
          return resolve();
        });
      });
    }
  }, {
    key: "install",
    value: function () {
      var _install = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2() {
        var _this$plugin$settings, copyBeforeInstall, copyAfterInstall, index, filename, commands, _index, pathTo, pathFrom, _ref, _ref2, from, to;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this$plugin$settings = this.plugin.settings, copyBeforeInstall = _this$plugin$settings.copyBeforeInstall, copyAfterInstall = _this$plugin$settings.copyAfterInstall;
                this.init();
                this.plugin.log('Dependencies has changed! Re-installing...');
                _context2.next = 5;
                return mkdirp.sync(this.layersPackageDir);

              case 5:
                _context2.next = 7;
                return this.copyProjectFile(this.plugin.settings.dependenciesPath);

              case 7:
                _context2.t0 = _regenerator["default"].keys(copyBeforeInstall);

              case 8:
                if ((_context2.t1 = _context2.t0()).done) {
                  _context2.next = 16;
                  break;
                }

                index = _context2.t1.value;
                filename = copyBeforeInstall[index];

                if (fs.existsSync(filename)) {
                  _context2.next = 14;
                  break;
                }

                _context2.next = 14;
                return this.copyProjectFile(filename);

              case 14:
                _context2.next = 8;
                break;

              case 16:
                if (!this.plugin.settings.customInstallationCommand) {
                  _context2.next = 24;
                  break;
                }

                _context2.t2 = console;
                _context2.next = 20;
                return this.run(this.plugin.settings.customInstallationCommand);

              case 20:
                _context2.t3 = _context2.sent;

                _context2.t2.log.call(_context2.t2, _context2.t3);

                _context2.next = 30;
                break;

              case 24:
                commands = this.plugin.runtimes.getCommands();
                _context2.t4 = console;
                _context2.next = 28;
                return this.run(commands[this.plugin.settings.packageManager]);

              case 28:
                _context2.t5 = _context2.sent;

                _context2.t4.log.call(_context2.t4, _context2.t5);

              case 30:
                _context2.t6 = _regenerator["default"].keys(copyAfterInstall);

              case 31:
                if ((_context2.t7 = _context2.t6()).done) {
                  _context2.next = 51;
                  break;
                }

                _index = _context2.t7.value;
                pathTo = copyAfterInstall[_index].to;
                pathFrom = copyAfterInstall[_index].from;
                _context2.next = 37;
                return resolveFile(path.join(this.layersPackageDir, pathFrom));

              case 37:
                _ref = _context2.sent;
                _ref2 = (0, _slicedToArray2["default"])(_ref, 1);
                from = _ref2[0];
                to = path.join(this.layersPackageDir, pathTo);
                _context2.prev = 41;
                _context2.next = 44;
                return fsExtra.copy(from, to);

              case 44:
                _context2.next = 49;
                break;

              case 46:
                _context2.prev = 46;
                _context2.t8 = _context2["catch"](41);
                console.log(_context2.t8);

              case 49:
                _context2.next = 31;
                break;

              case 51:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[41, 46]]);
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