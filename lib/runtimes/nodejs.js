"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var path = require('path');

var NodeJSRuntime = /*#__PURE__*/function () {
  function NodeJSRuntime(parent, runtime, runtimeDir) {
    (0, _classCallCheck2["default"])(this, NodeJSRuntime);
    this.parent = parent;
    this.plugin = parent.plugin;
    this["default"] = {
      runtime: runtime,
      runtimeDir: runtimeDir,
      libraryFolder: 'node_modules',
      packageManager: 'npm',
      packageManagerExtraArgs: '',
      dependenciesPath: 'package.json',
      compatibleRuntimes: [runtimeDir],
      compatibleArchitectures: parent.compatibleArchitectures,
      copyBeforeInstall: ['.npmrc', 'yarn.lock', 'package-lock.json'],
      packageExclude: ['node_modules/**']
    };
    this.commands = {
      npm: 'npm install --production --only=prod',
      yarn: 'yarn --production',
      pnpm: 'pnpm install --prod'
    };
  }

  (0, _createClass2["default"])(NodeJSRuntime, [{
    key: "init",
    value: function init() {
      var dependenciesPath = this.plugin.settings.dependenciesPath;
      var localpackageJson = path.join(process.cwd(), dependenciesPath);

      try {
        this.localPackage = require(localpackageJson);
      } catch (e) {
        this.plugin.log("Error: Can not find ".concat(localpackageJson, "!"));
        process.exit(1);
      }
    }
  }, {
    key: "isCompatibleVersion",
    value: function () {
      var _isCompatibleVersion = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(runtime) {
        var osVersion, _runtime$match, _runtime$match2, runtimeVersion;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.parent.run('node --version');

              case 2:
                osVersion = _context.sent;
                _runtime$match = runtime.match(/([0-9]+)\./), _runtime$match2 = (0, _slicedToArray2["default"])(_runtime$match, 1), runtimeVersion = _runtime$match2[0];
                return _context.abrupt("return", {
                  version: osVersion,
                  isCompatible: osVersion.startsWith("v".concat(runtimeVersion))
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
    key: "hasDependenciesChanges",
    value: function () {
      var _hasDependenciesChanges = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var remotePackage, isDifferent, parsedRemotePackage, dependencies;
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
                  _context2.next = 11;
                  break;
                }

                parsedRemotePackage = JSON.parse(remotePackage);
                dependencies = parsedRemotePackage.dependencies;
                this.plugin.log('Comparing package.json dependencies...');
                _context2.next = 10;
                return this.isDiff(dependencies, this.localPackage.dependencies);

              case 10:
                isDifferent = _context2.sent;

              case 11:
                return _context2.abrupt("return", isDifferent);

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function hasDependenciesChanges() {
        return _hasDependenciesChanges.apply(this, arguments);
      }

      return hasDependenciesChanges;
    }()
  }]);
  return NodeJSRuntime;
}();

module.exports = NodeJSRuntime;
//# sourceMappingURL=nodejs.js.map