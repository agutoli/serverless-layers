"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var fs = require('fs');

var path = require('path');

var PythonRuntime =
/*#__PURE__*/
function () {
  function PythonRuntime(plugin, runtime, runtimeDir) {
    (0, _classCallCheck2["default"])(this, PythonRuntime);
    this.plugin = plugin;
    this["default"] = {
      runtime: runtime,
      runtimeDir: runtimeDir,
      packageManager: 'pip',
      dependenciesPath: 'requirements.txt',
      compatibleRuntimes: [runtime],
      copyBeforeInstall: [],
      packageExclude: ['package.json', 'package-lock.json', 'node_modules/**']
    };
    this.commands = {
      pip: "pip install -r ".concat(this["default"].dependenciesPath, " -t .")
    };
    var localpackageJson = path.join(process.cwd(), this["default"].dependenciesPath);

    try {
      this.localPackage = fs.readFileSync(localpackageJson).toString();
    } catch (e) {
      this.log("Error: Can not find ".concat(localpackageJson, "!"));
      process.exit(1);
    }
  }

  (0, _createClass2["default"])(PythonRuntime, [{
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
      _regenerator["default"].mark(function _callee() {
        var remotePackage, isDifferent;
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
                  _context.next = 9;
                  break;
                }

                this.plugin.log("Comparing ".concat(this["default"].dependenciesPath, " dependencies..."));
                _context.next = 8;
                return this.isDiff(remotePackage, this.localPackage);

              case 8:
                isDifferent = _context.sent;

              case 9:
                return _context.abrupt("return", isDifferent);

              case 10:
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
  return PythonRuntime;
}();

module.exports = PythonRuntime;
//# sourceMappingURL=python0.js.map