"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var nodejs = require('./nodejs');

var python = require('./python');

var Runtimes =
/*#__PURE__*/
function () {
  function Runtimes(plugin) {
    (0, _classCallCheck2["default"])(this, Runtimes);
    this.plugin = plugin;
    var runtime = this.plugin.service.provider.runtime;
    var patterns = {
      python: [/python/, python],
      nodejs: [/node/, nodejs]
    };

    for (var env in patterns) {
      if (patterns[env][0].test(runtime)) {
        this._runtime = new patterns[env][1](this.plugin, runtime, env);
        break;
      }
    }
  }

  (0, _createClass2["default"])(Runtimes, [{
    key: "install",
    value: function install() {
      return this._runtime.install();
    }
  }, {
    key: "getDefaultSettings",
    value: function getDefaultSettings() {
      var inboundSettings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (inboundSettings.packagePath) {
        console.warn('WARN You should use "dependenciesPath" instead of the deprecated "packagePath" param.');
        inboundSettings.dependenciesPath = inboundSettings.packagePath;
      }

      return _objectSpread({}, this._runtime["default"], {}, inboundSettings);
    }
  }, {
    key: "getCommands",
    value: function getCommands() {
      return this._runtime.commands;
    }
  }, {
    key: "hasDependencesChanged",
    value: function hasDependencesChanged() {
      return this._runtime.hasDependencesChanged();
    }
  }]);
  return Runtimes;
}();

module.exports = Runtimes;
//# sourceMappingURL=index.js.map