"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var fs = require('fs');

var path = require('path');

var RubyRuntime =
/*#__PURE__*/
function () {
  function RubyRuntime(parent, runtime, runtimeDir) {
    (0, _classCallCheck2["default"])(this, RubyRuntime);
    this.parent = parent;
    this.plugin = parent.plugin;
    this["default"] = {
      runtime: runtime,
      runtimeDir: runtimeDir,
      packageManager: 'bundle',
      dependenciesPath: 'Gemfile',
      compatibleRuntimes: [runtime],
      copyBeforeInstall: ['Gemfile.lock'],
      copyAfterInstall: [{
        from: 'ruby',
        to: 'gems'
      }],
      packageExclude: ['node_modules/**', 'package.json', 'package-lock.json', 'vendor/**', '.bundle']
    };
    this.commands = {
      bundle: "bundle install --gemfile=".concat(this["default"].dependenciesPath, " --path=./")
    };
    var localpackageJson = path.join(process.cwd(), this["default"].dependenciesPath);

    try {
      this.localPackage = fs.readFileSync(localpackageJson).toString();
    } catch (e) {
      this.log("Error: Can not find ".concat(localpackageJson, "!"));
      process.exit(1);
    }
  }

  (0, _createClass2["default"])(RubyRuntime, [{
    key: "isCompatibleVersion",
    value: function () {
      var _isCompatibleVersion = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(runtime) {
        var osVersion, _runtime$match, _runtime$match2, runtimeVersion;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.parent.run('ruby --version');

              case 2:
                osVersion = _context.sent;
                _runtime$match = runtime.match(/[0-9].[0-9]/), _runtime$match2 = (0, _slicedToArray2["default"])(_runtime$match, 1), runtimeVersion = _runtime$match2[0];
                return _context.abrupt("return", {
                  version: osVersion,
                  isCompatible: osVersion.startsWith("ruby ".concat(runtimeVersion))
                });

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function isCompatibleVersion(_x) {
        return _isCompatibleVersion.apply(this, arguments);
      }

      return isCompatibleVersion;
    }()
  }, {
    key: "isDiff",
    value: function isDiff(depsA, depsB) {
      if (!depsA) {
        return true;
      }

      return depsA !== depsB;
    }
  }, {
    key: "hasDependencesChanged",
    value: function () {
      var _hasDependencesChanged = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2() {
        var remotePackage, isDifferent;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.plugin.bucketService.downloadDependencesFile();

              case 2:
                remotePackage = _context2.sent;
                isDifferent = true;

                if (!remotePackage) {
                  _context2.next = 9;
                  break;
                }

                this.plugin.log("Comparing ".concat(this["default"].dependenciesPath, " dependencies..."));
                _context2.next = 8;
                return this.isDiff(remotePackage, this.localPackage);

              case 8:
                isDifferent = _context2.sent;

              case 9:
                return _context2.abrupt("return", isDifferent);

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function hasDependencesChanged() {
        return _hasDependencesChanged.apply(this, arguments);
      }

      return hasDependencesChanged;
    }()
  }]);
  return RubyRuntime;
}();

module.exports = RubyRuntime;
//# sourceMappingURL=ruby.js.map