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

var exec = require('child_process').execSync;

var copyFile = require('fs-copy-file'); // node v6.10.3 support


var AbstractService = require('../AbstractService');

var Dependencies =
/*#__PURE__*/
function (_AbstractService) {
  (0, _inherits2.default)(Dependencies, _AbstractService);

  function Dependencies() {
    (0, _classCallCheck2.default)(this, Dependencies);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Dependencies).apply(this, arguments));
  }

  (0, _createClass2.default)(Dependencies, [{
    key: "init",
    value: function init() {
      this.commands = {
        npm: 'npm install',
        yarn: 'yarn'
      };
      this.initialCwd = process.cwd();
      this.nodeJsDir = path.join(process.cwd(), this.plugin.settings.compileDir, 'layers', 'nodejs');
    }
  }, {
    key: "run",
    value: function run(cmd) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      console.log(exec(cmd, options).toString());
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
        copyFile(filename, path.join(_this.nodeJsDir, filename), function (copyErr) {
          if (copyErr) throw copyErr;
          return resolve();
        });
      });
    }
  }, {
    key: "install",
    value: function () {
      var _install = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.init();
                this.plugin.log('Dependencies has changed! Re-installing...');
                _context.next = 4;
                return mkdirp.sync(this.nodeJsDir);

              case 4:
                _context.next = 6;
                return this.copyProjectFile(this.plugin.settings.packagePath);

              case 6:
                if (!(this.plugin.settings.packageManager === 'npm')) {
                  _context.next = 9;
                  break;
                }

                _context.next = 9;
                return this.copyProjectFile('package-lock.json');

              case 9:
                if (!(this.plugin.settings.packageManager === 'yarn')) {
                  _context.next = 12;
                  break;
                }

                _context.next = 12;
                return this.copyProjectFile('yarn.lock');

              case 12:
                process.chdir(this.nodeJsDir); // packages installation

                this.run(this.commands[this.plugin.settings.packageManager]);
                process.chdir(this.initialCwd);

              case 15:
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