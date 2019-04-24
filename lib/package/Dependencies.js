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

var mkdirp = require('mkdirp');

var _install = require('npm-install-package');

var copyFile = require('fs-copy-file'); // v6.10.3 support


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
    key: "install",
    value: function () {
      var _install2 = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var _this = this;

        var initialCwd, nodeJsDir;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.plugin.log('Dependencies has changed! Re-installing...');
                initialCwd = process.cwd();
                nodeJsDir = path.join(process.cwd(), this.plugin.settings.compileDir, 'layers', 'nodejs');
                _context.next = 5;
                return mkdirp.sync(nodeJsDir);

              case 5:
                return _context.abrupt("return", new Promise(function (resolve) {
                  copyFile(_this.plugin.settings.packagePath, path.join(nodeJsDir, 'package.json'), function (copyErr) {
                    if (copyErr) throw copyErr; // install deps

                    process.chdir(nodeJsDir);
                    var opts = {
                      saveDev: false,
                      cache: true,
                      silent: false
                    };

                    _install(_this.plugin.getDependenciesList(), opts, function (installErr) {
                      process.chdir(initialCwd);
                      if (installErr) throw installErr;
                      resolve();
                    });
                  });
                }));

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function install() {
        return _install2.apply(this, arguments);
      }

      return install;
    }()
  }]);
  return Dependencies;
}(AbstractService);

module.exports = Dependencies;
//# sourceMappingURL=Dependencies.js.map