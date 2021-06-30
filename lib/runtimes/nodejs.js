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
      dependenciesPath: 'package.json',
      dependenciesLockPath: 'package-lock.json',
      compatibleRuntimes: [runtimeDir],
      copyBeforeInstall: ['.npmrc', 'yarn.lock', 'package-lock.json'],
      packageExclude: ['node_modules/**']
    };
    this.commands = {
      npm: 'npm install --production --only=prod',
      yarn: 'yarn --production'
    };
  }

  (0, _createClass2["default"])(NodeJSRuntime, [{
    key: "init",
    value: function init() {
      var _this$plugin$settings = this.plugin.settings,
          dependenciesPath = _this$plugin$settings.dependenciesPath,
          dependenciesLockPath = _this$plugin$settings.dependenciesLockPath;
      var localpackageJson = path.join(process.cwd(), dependenciesPath);
      var localpackageLockJson = path.join(process.cwd(), dependenciesLockPath);

      try {
        this.localPackage = require(localpackageJson);
      } catch (e) {
        this.plugin.log("Error: Can not find ".concat(localpackageJson, " or ").concat(localpackageLockJson, "!"));
        process.exit(1);
      }

      try {
        this.localPackageLock = require(localpackageLockJson); // eslint-disable-next-line no-empty
      } catch (e) {}
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
        var remotePackage, isDifferent, parsedRemotePackage, dependencies, version, isDifferentPackageJson, isDifferentPackageLock, dependenciesLockPath, remotePackageLock, parsedRemotePackageLock, lockDependencies, localLockDependencies;
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
                  _context2.next = 19;
                  break;
                }

                parsedRemotePackage = JSON.parse(remotePackage);
                dependencies = parsedRemotePackage.dependencies, version = parsedRemotePackage.version;
                this.plugin.log('Comparing package.json dependencies...');
                _context2.next = 10;
                return this.isDiff(dependencies, this.localPackage.dependencies);

              case 10:
                isDifferentPackageJson = _context2.sent;
                isDifferentPackageLock = false;

                if (!this.localPackageLock) {
                  _context2.next = 18;
                  break;
                }

                dependenciesLockPath = this.plugin.settings.dependenciesLockPath;
                _context2.next = 16;
                return this.plugin.bucketService.getFile(dependenciesLockPath);

              case 16:
                remotePackageLock = _context2.sent;

                if (remotePackageLock) {
                  parsedRemotePackageLock = JSON.parse(remotePackageLock);
                  lockDependencies = Object.fromEntries(Object.entries(parsedRemotePackageLock.dependencies).filter(function (dependency) {
                    return dependency[1].dev !== true;
                  }));
                  localLockDependencies = Object.fromEntries(Object.entries(this.localPackageLock.dependencies).filter(function (dependency) {
                    return dependency[1].dev !== true;
                  }));
                  isDifferentPackageLock = JSON.stringify(lockDependencies) !== JSON.stringify(localLockDependencies);
                } else {
                  isDifferentPackageLock = true;
                }

              case 18:
                isDifferent = version !== this.localPackage.version || isDifferentPackageJson || isDifferentPackageLock;

              case 19:
                return _context2.abrupt("return", isDifferent);

              case 20:
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