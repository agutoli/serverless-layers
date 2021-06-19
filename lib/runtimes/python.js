"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var fs = require('fs');

var path = require('path');

var PythonRuntime = /*#__PURE__*/function () {
  function PythonRuntime(parent, runtime, runtimeDir) {
    (0, _classCallCheck2["default"])(this, PythonRuntime);
    this.parent = parent;
    this.plugin = parent.plugin;
    this["default"] = {
      runtime: runtime,
      runtimeDir: runtimeDir,
      libraryFolder: 'site-packages',
      packageManager: 'pip',
      dependenciesPath: 'requirements.txt',
      compatibleRuntimes: [runtime],
      copyBeforeInstall: [],
      packageExclude: ['package.json', 'package-lock.json', 'node_modules/**']
    };
    this.commands = {
      pip: "pip install -r ".concat(this["default"].dependenciesPath, " -t .")
    };
  }

  (0, _createClass2["default"])(PythonRuntime, [{
    key: "init",
    value: function init() {
      var dependenciesPath = this.plugin.settings.dependenciesPath;
      var localpackageJson = path.join(process.cwd(), dependenciesPath);

      try {
        this.localPackage = fs.readFileSync(localpackageJson).toString();
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
                return this.parent.run('python --version');

              case 2:
                osVersion = _context.sent;
                _runtime$match = runtime.match(/[0-9].[0-9]/), _runtime$match2 = (0, _slicedToArray2["default"])(_runtime$match, 1), runtimeVersion = _runtime$match2[0];
                return _context.abrupt("return", {
                  version: osVersion,
                  isCompatible: osVersion.startsWith("Python ".concat(runtimeVersion))
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
    key: "hasDependenciesChanges",
    value: function () {
      var _hasDependenciesChanges = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
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

      function hasDependenciesChanges() {
        return _hasDependenciesChanges.apply(this, arguments);
      }

      return hasDependenciesChanges;
    }()
  }]);
  return PythonRuntime;
}();

module.exports = PythonRuntime;
//# sourceMappingURL=python.js.map