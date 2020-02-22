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

var mkdirp = require('mkdirp');

var _require = require('child_process'),
    execSync = _require.execSync;

var copyFile = require('fs-copy-file'); // node v6.10.3 support


var AbstractService = require('../AbstractService');

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
    value: function run(cmd) {
      console.log(execSync(cmd, {
        cwd: this.layersPackageDir,
        env: process.env
      }).toString());
    }
  }, {
    key: "copyProjectFile",
    value: function copyProjectFile(filename) {
      var _this = this;

      this.init();

      if (!fs.existsSync(filename)) {
        this.plugin.log("[warning] \"".concat(filename, "\" file does not exists!"));
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
      _regenerator["default"].mark(function _callee() {
        var copyBeforeInstall, index, filename, commands;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                copyBeforeInstall = this.plugin.settings.copyBeforeInstall;
                this.init();
                this.plugin.log('Dependencies has changed! Re-installing...');
                _context.next = 5;
                return mkdirp.sync(this.layersPackageDir);

              case 5:
                _context.next = 7;
                return this.copyProjectFile(this.plugin.settings.dependenciesPath);

              case 7:
                _context.t0 = _regenerator["default"].keys(copyBeforeInstall);

              case 8:
                if ((_context.t1 = _context.t0()).done) {
                  _context.next = 16;
                  break;
                }

                index = _context.t1.value;
                filename = copyBeforeInstall[index];

                if (fs.existsSync(filename)) {
                  _context.next = 14;
                  break;
                }

                _context.next = 14;
                return this.copyProjectFile(filename);

              case 14:
                _context.next = 8;
                break;

              case 16:
                if (!this.plugin.settings.customInstallationCommand) {
                  _context.next = 18;
                  break;
                }

                return _context.abrupt("return", this.run(this.plugin.settings.customInstallationCommand));

              case 18:
                commands = this.plugin.runtimes.getCommands(); // packages installation

                return _context.abrupt("return", this.run(commands[this.plugin.settings.packageManager]));

              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
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