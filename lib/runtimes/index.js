"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var _require = require('child_process'),
  exec = _require.exec;
var ruby = require('./ruby');
var nodejs = require('./nodejs');
var python = require('./python');
var Runtimes = /*#__PURE__*/function () {
  function Runtimes(plugin) {
    var _this = this;
    (0, _classCallCheck2["default"])(this, Runtimes);
    this.plugin = plugin;
    this.compatibleArchitectures = ["x86_64", "arm64"];
    var runtime = this.plugin.service.provider.runtime;
    if (!runtime) {
      this.plugin.error('service.provider.runtime is required!');
      return process.exit(1);
    }
    var patterns = {
      python: [/python/, python],
      nodejs: [/node/, nodejs],
      ruby: [/ruby/, ruby]
    };
    for (var env in patterns) {
      if (patterns[env][0].test(runtime)) {
        this._runtime = new patterns[env][1](this, runtime, env);
        break;
      }
    }
    if (!this._runtime) {
      this.plugin.log("\"".concat(runtime, "\" runtime is not supported (yet)."));
      return process.exit(1);
    }
    this._runtime.isCompatibleVersion(runtime).then(function (data) {
      if (!data.isCompatible) {
        _this.plugin.warn('=============================================================');
        _this.plugin.warn("WARN: The current environment and Lambda runtime don't match (current=".concat(data.version.replace('\n', ''), " vs runtime=").concat(runtime, ")."));
        _this.plugin.warn('=============================================================\n');
      }
    });
  }
  (0, _createClass2["default"])(Runtimes, [{
    key: "init",
    value: function init() {
      this._runtime.init();
    }
  }, {
    key: "run",
    value: function run(cmd) {
      return new Promise(function (resolve, reject) {
        exec(cmd, function (err, stdout, out) {
          if (err) return reject(err);
          return resolve(stdout || out);
        });
      });
    }
  }, {
    key: "getDefaultSettings",
    value: function getDefaultSettings() {
      var inboundSettings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (inboundSettings.packagePath) {
        console.warn('WARN You should use "dependenciesPath" instead of the deprecated "packagePath" param.');
        inboundSettings.dependenciesPath = inboundSettings.packagePath;
      }
      return _objectSpread(_objectSpread({}, this._runtime["default"]), inboundSettings);
    }
  }, {
    key: "getCommands",
    value: function getCommands() {
      return this._runtime.commands;
    }
  }, {
    key: "hasDependenciesChanges",
    value: function hasDependenciesChanges() {
      return this._runtime.hasDependenciesChanges();
    }
  }]);
  return Runtimes;
}();
module.exports = Runtimes;
//# sourceMappingURL=index.js.map