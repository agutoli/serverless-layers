"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var path = require('path');

var NodeJSRuntime =
/*#__PURE__*/
function () {
  function NodeJSRuntime(plugin, runtime, runtimeDir) {
    (0, _classCallCheck2["default"])(this, NodeJSRuntime);
    this.plugin = plugin;
    this["default"] = {
      runtime: runtime,
      runtimeDir: runtimeDir,
      packageManager: 'npm',
      dependenciesPath: 'package.json',
      compatibleRuntimes: [runtimeDir],
      copyBeforeInstall: ['yarn.lock', 'package-lock.json'],
      packageExclude: ['node_modules/**']
    };
    this.commands = {
      npm: 'npm install --production',
      yarn: 'yarn --production'
    };
    var localpackageJson = path.join(process.cwd(), this["default"].dependenciesPath);

    try {
      this.localPackage = require(localpackageJson);
    } catch (e) {
      this.log("Error: Can not find ".concat(localpackageJson, "!"));
      process.exit(1);
    }
  }

  (0, _createClass2["default"])(NodeJSRuntime, [{
    key: "isDiff",
    value: function isDiff(depsA, depsB) {
      if (!depsA) {
        return true;
      }

      var depsKeyA = Object.keys(depsA);
      var depsKeyB = Object.keys(depsB);
      var isSizeEqual = depsKeyA.length === depsKeyB.length;
      if (!isSizeEqual) return true;
      var hasDifference = false;
      Object.keys(depsA).forEach(function (dependence) {
        if (depsA[dependence] !== depsB[dependence]) {
          hasDifference = true;
        }
      });
      return hasDifference;
    }
  }, {
    key: "hasDependencesChanged",
    value: function () {
      var _hasDependencesChanged = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var remotePackage, isDifferent, parsedRemotePackage, dependencies;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.plugin.bucketService.downloadDependencesFile();

              case 2:
                remotePackage = _context.sent;
                isDifferent = true;

                if (!remotePackage) {
                  _context.next = 11;
                  break;
                }

                parsedRemotePackage = JSON.parse(remotePackage);
                dependencies = parsedRemotePackage.dependencies;
                this.plugin.log('Comparing package.json dependencies...');
                _context.next = 10;
                return this.isDiff(dependencies, this.localPackage.dependencies);

              case 10:
                isDifferent = _context.sent;

              case 11:
                return _context.abrupt("return", isDifferent);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function hasDependencesChanged() {
        return _hasDependencesChanged.apply(this, arguments);
      }

      return hasDependencesChanged;
    }()
  }]);
  return NodeJSRuntime;
}();

module.exports = NodeJSRuntime;
//# sourceMappingURL=nodejs.js.map