"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var fs = require('fs');
var chalk = require('chalk');
var fsExtra = require('fs-extra');
var glob = require('glob');
var path = require('path');
var mkdirp = require('mkdirp');
var _require = require('child_process'),
  execSync = _require.execSync;
var copyFile = require('fs-copy-file'); // node v6.10.3 support

var AbstractService = require('../AbstractService');
function resolveFile(from) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Promise(function (resolve, reject) {
    glob(from, opts, function (err, files) {
      if (err) return reject();
      return resolve(files);
    });
  });
}
var Dependencies = /*#__PURE__*/function (_AbstractService) {
  (0, _inherits2["default"])(Dependencies, _AbstractService);
  var _super = _createSuper(Dependencies);
  function Dependencies() {
    (0, _classCallCheck2["default"])(this, Dependencies);
    return _super.apply(this, arguments);
  }
  (0, _createClass2["default"])(Dependencies, [{
    key: "init",
    value: function init() {
      this.layersPackageDir = this.getLayerPackageDir();
      return mkdirp.sync(this.layersPackageDir);
    }
  }, {
    key: "getDepsPath",
    value: function getDepsPath() {
      var settings = this.plugin.settings;
      var rooPath = path.join(settings.path, settings.dependenciesPath);
      return path.resolve(rooPath);
    }

    /**
     * Implementing package pattern ignore
     * https://github.com/agutoli/serverless-layers/issues/118
     */
  }, {
    key: "excludePatternFiles",
    value: function () {
      var _excludePatternFiles = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _this = this;
        var filesToIgnore, filesToExclude, _iterator, _step, pattern, resolvedFiles, _resolvedFiles;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              filesToIgnore = [];
              filesToExclude = [];
              /**
               * Patterns allows you to define globs that will be excluded / included from the
               * resulting artifact. If you wish to exclude files you can use a glob pattern prefixed
               * with ! such as !exclude-me/**. Serverless will run the glob patterns in order so
               * you can always re-include previously excluded files and directories.
               *
               * Reference: https://www.serverless.com/framework/docs/providers/aws/guide/packaging
               */
              _iterator = _createForOfIteratorHelper(this.plugin.settings.layerOptimization.cleanupPatterns);
              _context.prev = 3;
              _iterator.s();
            case 5:
              if ((_step = _iterator.n()).done) {
                _context.next = 20;
                break;
              }
              pattern = _step.value;
              if (!pattern.startsWith('!')) {
                _context.next = 14;
                break;
              }
              _context.next = 10;
              return resolveFile(pattern.substr(1), {
                cwd: this.layersPackageDir
              });
            case 10:
              resolvedFiles = _context.sent;
              filesToIgnore = filesToIgnore.concat(resolvedFiles);
              _context.next = 18;
              break;
            case 14:
              _context.next = 16;
              return resolveFile(pattern, {
                cwd: this.layersPackageDir
              });
            case 16:
              _resolvedFiles = _context.sent;
              filesToExclude = filesToExclude.concat(_resolvedFiles);
            case 18:
              _context.next = 5;
              break;
            case 20:
              _context.next = 25;
              break;
            case 22:
              _context.prev = 22;
              _context.t0 = _context["catch"](3);
              _iterator.e(_context.t0);
            case 25:
              _context.prev = 25;
              _iterator.f();
              return _context.finish(25);
            case 28:
              filesToExclude.forEach(function (filename) {
                // check if folder or files are being ignored, and shouldn't be removed.
                var shouldBeIgnored = filesToIgnore.filter(function (x) {
                  return x.startsWith(filename);
                }).length > 0;
                if (!shouldBeIgnored) {
                  _this.plugin.warn("[layerOptimization.cleanupPatterns] Ignored: ".concat(filename));
                  fs.rmSync(path.join(_this.layersPackageDir, filename), {
                    force: true,
                    recursive: true
                  });
                }
              });
            case 29:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[3, 22, 25, 28]]);
      }));
      function excludePatternFiles() {
        return _excludePatternFiles.apply(this, arguments);
      }
      return excludePatternFiles;
    }()
  }, {
    key: "run",
    value: function () {
      var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(cmd) {
        var output;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              output = execSync(cmd, {
                cwd: this.layersPackageDir,
                env: process.env,
                maxBuffer: 1024 * 1024 * 500
              }).toString();
              return _context2.abrupt("return", output);
            case 2:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function run(_x) {
        return _run.apply(this, arguments);
      }
      return run;
    }()
  }, {
    key: "copyProjectFile",
    value: function copyProjectFile(filePath) {
      var _this2 = this;
      var fileName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      this.init();
      if (!fs.existsSync(filePath)) {
        this.plugin.warn("[warning] \"".concat(filePath, "\" file does not exists!"));
        return true;
      }
      return new Promise(function (resolve) {
        var destFile = path.join(_this2.layersPackageDir, fileName || path.basename(filePath));
        copyFile(filePath, destFile, function (copyErr) {
          if (copyErr) throw copyErr;
          return resolve();
        });
      });
    }
  }, {
    key: "install",
    value: function () {
      var _install = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        var _this$plugin$settings, copyBeforeInstall, copyAfterInstall, renameFilename, index, filename, commands, _this$plugin$settings2, packageManagerExtraArgs, packageManager, installCommand, _index, pathTo, pathFrom, _yield$resolveFile, _yield$resolveFile2, from, to;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _this$plugin$settings = this.plugin.settings, copyBeforeInstall = _this$plugin$settings.copyBeforeInstall, copyAfterInstall = _this$plugin$settings.copyAfterInstall;
              this.init();
              this.plugin.log("".concat(chalk.inverse.yellow(' Changes identified '), "! Re-installing..."));

              /**
               * This is necessary because npm is
               * not possible to specify a custom
               * name for package.json.
               */
              renameFilename = null;
              if (this.plugin.settings.runtimeDir === 'nodejs') {
                renameFilename = 'package.json';
              }
              _context3.next = 7;
              return this.copyProjectFile(this.getDepsPath(), renameFilename);
            case 7:
              _context3.t0 = _regenerator["default"].keys(copyBeforeInstall);
            case 8:
              if ((_context3.t1 = _context3.t0()).done) {
                _context3.next = 15;
                break;
              }
              index = _context3.t1.value;
              filename = copyBeforeInstall[index];
              _context3.next = 13;
              return this.copyProjectFile(filename);
            case 13:
              _context3.next = 8;
              break;
            case 15:
              if (!this.plugin.settings.customInstallationCommand) {
                _context3.next = 25;
                break;
              }
              _context3.t2 = console;
              _context3.t3 = chalk;
              _context3.next = 20;
              return this.run(this.plugin.settings.customInstallationCommand);
            case 20:
              _context3.t4 = _context3.sent;
              _context3.t5 = _context3.t3.white.call(_context3.t3, _context3.t4);
              _context3.t2.log.call(_context3.t2, _context3.t5);
              _context3.next = 36;
              break;
            case 25:
              commands = this.plugin.runtimes.getCommands();
              _this$plugin$settings2 = this.plugin.settings, packageManagerExtraArgs = _this$plugin$settings2.packageManagerExtraArgs, packageManager = _this$plugin$settings2.packageManager;
              installCommand = "".concat(commands[packageManager], " ").concat(packageManagerExtraArgs);
              this.plugin.log(chalk.white.bold(installCommand));
              _context3.t6 = console;
              _context3.t7 = chalk;
              _context3.next = 33;
              return this.run(installCommand);
            case 33:
              _context3.t8 = _context3.sent;
              _context3.t9 = _context3.t7.white.call(_context3.t7, _context3.t8);
              _context3.t6.log.call(_context3.t6, _context3.t9);
            case 36:
              _context3.t10 = _regenerator["default"].keys(copyAfterInstall);
            case 37:
              if ((_context3.t11 = _context3.t10()).done) {
                _context3.next = 57;
                break;
              }
              _index = _context3.t11.value;
              pathTo = copyAfterInstall[_index].to;
              pathFrom = copyAfterInstall[_index].from;
              _context3.next = 43;
              return resolveFile(path.join(this.layersPackageDir, pathFrom));
            case 43:
              _yield$resolveFile = _context3.sent;
              _yield$resolveFile2 = (0, _slicedToArray2["default"])(_yield$resolveFile, 1);
              from = _yield$resolveFile2[0];
              to = path.join(this.layersPackageDir, pathTo);
              _context3.prev = 47;
              _context3.next = 50;
              return fsExtra.copy(from, to);
            case 50:
              _context3.next = 55;
              break;
            case 52:
              _context3.prev = 52;
              _context3.t12 = _context3["catch"](47);
              console.log(_context3.t12);
            case 55:
              _context3.next = 37;
              break;
            case 57:
              _context3.prev = 57;
              _context3.next = 60;
              return this.excludePatternFiles();
            case 60:
              _context3.next = 65;
              break;
            case 62:
              _context3.prev = 62;
              _context3.t13 = _context3["catch"](57);
              if (!this.plugin.service["package"].patterns) {
                this.plugin.warn("[warning] package.patterns option is not set. @see https://www.serverless.com/framework/docs/providers/aws/guide/packaging");
              } else {
                console.error(_context3.t13);
                process.exit(1);
              }
            case 65:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[47, 52], [57, 62]]);
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