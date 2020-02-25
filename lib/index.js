"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var BbPromise = require('bluebird');

var path = require('path');

var chalk = require('chalk');

var Runtimes = require('./runtimes');

var LayersService = require('./aws/LayersService');

var BucketService = require('./aws/BucketService');

var CloudFormationService = require('./aws/CloudFormationService');

var ZipService = require('./package/ZipService');

var Dependencies = require('./package/Dependencies');

var ServerlessLayers =
/*#__PURE__*/
function () {
  function ServerlessLayers(serverless, options) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, ServerlessLayers);
    this.cacheObject = {};
    this.options = options;
    this.serverless = serverless;
    this.initialized = false; // hooks

    this.hooks = {
      'before:package:function:package': function beforePackageFunctionPackage() {
        return BbPromise.bind(_this).then(function () {
          return _this.init().then(function () {
            return _this.main();
          });
        });
      },
      'before:package:initialize': function beforePackageInitialize() {
        return BbPromise.bind(_this).then(function () {
          return _this.init().then(function () {
            return _this.main();
          });
        });
      },
      'aws:info:displayLayers': function awsInfoDisplayLayers() {
        return BbPromise.bind(_this).then(function () {
          return _this.init();
        }).then(function () {
          return _this.finalizeDeploy();
        });
      },
      'plugin:uninstall:uninstall': function pluginUninstallUninstall() {
        return BbPromise.bind(_this).then(function () {
          return _this.init();
        }).then(function () {
          return _this.cleanUpLayers();
        });
      },
      'remove:remove': function removeRemove() {
        return BbPromise.bind(_this).then(function () {
          return _this.init();
        }).then(function () {
          return _this.cleanUpLayers();
        });
      }
    };
  }

  (0, _createClass2["default"])(ServerlessLayers, [{
    key: "init",
    value: function () {
      var _init = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var version;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.initialized) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                this.provider = this.serverless.getProvider('aws');
                this.service = this.serverless.service;
                this.options.region = this.provider.getRegion(); // bindings

                this.log = this.log.bind(this);
                this.main = this.main.bind(this);
                version = this.serverless.getVersion().replace(/\./g, '');

                if (version < 1340) {
                  this.log("Error: Please install serverless >= 1.34.0 (current ".concat(this.serverless.getVersion(), ")"));
                  process.exit(1);
                }

                this.runtimes = new Runtimes(this);
                this.settings = this.getSettings();
                this.zipService = new ZipService(this);
                this.dependencies = new Dependencies(this);
                this.layersService = new LayersService(this);
                this.bucketService = new BucketService(this);
                this.cloudFormationService = new CloudFormationService(this);
                this.initialized = true;

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: "getSettings",
    value: function getSettings() {
      var inboundSettings = (this.serverless.service.custom || {})['serverless-layers'];
      return _objectSpread({
        compileDir: '.serverless',
        customInstallationCommand: null,
        layersDeploymentBucket: this.service.provider.deploymentBucket
      }, this.runtimes.getDefaultSettings(inboundSettings));
    }
  }, {
    key: "main",
    value: function () {
      var _main = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2() {
        var isDifferent, currentLayerARN, version;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.dependencies.init();

              case 2:
                _context2.next = 4;
                return this.runtimes.hasDependencesChanged();

              case 4:
                isDifferent = _context2.sent;
                // merge package default options
                this.mergePackageOptions();
                _context2.next = 8;
                return this.getLayerArn();

              case 8:
                currentLayerARN = _context2.sent;

                if (!(!isDifferent && currentLayerARN)) {
                  _context2.next = 13;
                  break;
                }

                this.log("Not has changed! Using same layer arn: ".concat(currentLayerARN));
                this.relateLayerWithFunctions(currentLayerARN);
                return _context2.abrupt("return");

              case 13:
                _context2.next = 15;
                return this.dependencies.install();

              case 15:
                _context2.next = 17;
                return this.zipService["package"]();

              case 17:
                _context2.next = 19;
                return this.bucketService.uploadZipFile();

              case 19:
                _context2.next = 21;
                return this.layersService.publishVersion();

              case 21:
                version = _context2.sent;
                _context2.next = 24;
                return this.bucketService.uploadDependencesFile();

              case 24:
                this.relateLayerWithFunctions(version.LayerVersionArn);

              case 25:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function main() {
        return _main.apply(this, arguments);
      }

      return main;
    }()
  }, {
    key: "getStackName",
    value: function getStackName() {
      return this.provider.naming.getStackName();
    }
  }, {
    key: "getBucketName",
    value: function getBucketName() {
      if (!this.settings.layersDeploymentBucket) {
        throw new Error('Please, you should specify "deploymentBucket" or "layersDeploymentBucket" option for this plugin!\n');
      }

      return this.settings.layersDeploymentBucket;
    }
  }, {
    key: "getPathZipFileName",
    value: function getPathZipFileName() {
      return "".concat(path.join(process.cwd(), this.settings.compileDir, this.getStackName()), ".zip");
    }
  }, {
    key: "getBucketLayersPath",
    value: function getBucketLayersPath() {
      var serviceStage = "".concat(this.serverless.service.service, "/").concat(this.options.stage);
      var deploymentPrefix = 'serverless';

      if (this.provider.getDeploymentPrefix) {
        deploymentPrefix = this.provider.getDeploymentPrefix();
      }

      return path.join(deploymentPrefix, serviceStage, 'layers').replace(/\\/g, '/');
    }
  }, {
    key: "getLayerArn",
    value: function () {
      var _getLayerArn = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3() {
        var outputs, logicalId;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!this.cacheObject.LayerVersionArn) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt("return", this.cacheObject.LayerVersionArn);

              case 2:
                _context3.next = 4;
                return this.cloudFormationService.getOutputs();

              case 4:
                outputs = _context3.sent;

                if (outputs) {
                  _context3.next = 7;
                  break;
                }

                return _context3.abrupt("return", null);

              case 7:
                logicalId = this.getOutputLogicalId();
                return _context3.abrupt("return", (outputs.find(function (x) {
                  return x.OutputKey === logicalId;
                }) || {}).OutputValue);

              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getLayerArn() {
        return _getLayerArn.apply(this, arguments);
      }

      return getLayerArn;
    }()
  }, {
    key: "getOutputLogicalId",
    value: function getOutputLogicalId() {
      return this.provider.naming.getLambdaLayerOutputLogicalId(this.getStackName());
    }
  }, {
    key: "mergePackageOptions",
    value: function mergePackageOptions() {
      var packageExclude = this.settings.packageExclude;
      var pkg = this.service["package"];
      var opts = {
        individually: false,
        excludeDevDependencies: false,
        exclude: []
      };
      this.service["package"] = _objectSpread({}, opts, {}, pkg);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = packageExclude[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var excludeFile = _step.value;
          var hasRule = (this.service["package"].exclude || '').indexOf(excludeFile);

          if (hasRule === -1) {
            this.service["package"].exclude.push(excludeFile);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "relateLayerWithFunctions",
    value: function relateLayerWithFunctions(layerArn) {
      var _this2 = this;

      this.log('Associating layers...');
      var functions = this.service.functions;
      Object.keys(functions).forEach(function (funcName) {
        functions[funcName].layers = functions[funcName].layers || [];
        functions[funcName].layers.push(layerArn);

        _this2.log("function.".concat(funcName, " - ").concat(layerArn));
      });
      this.service.resources = this.service.resources || {};
      this.service.resources.Outputs = this.service.resources.Outputs || {};
      var outputName = this.getOutputLogicalId();
      Object.assign(this.service.resources.Outputs, (0, _defineProperty2["default"])({}, outputName, {
        Value: layerArn,
        Export: {
          Name: outputName
        }
      }));
    }
  }, {
    key: "getDependenciesList",
    value: function getDependenciesList() {
      var _this3 = this;

      return Object.keys(this.localPackage.dependencies || []).map(function (x) {
        return "".concat(x, "@").concat(_this3.localPackage.dependencies[x]);
      });
    }
  }, {
    key: "finalizeDeploy",
    value: function () {
      var _finalizeDeploy = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee4() {
        var _this4 = this;

        var currentLayerARN;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.getLayerArn();

              case 2:
                currentLayerARN = _context4.sent;
                Object.keys(this.service.functions).forEach(function (funcName) {
                  _this4.log("function.".concat(funcName, " = layers.").concat(currentLayerARN));
                });

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function finalizeDeploy() {
        return _finalizeDeploy.apply(this, arguments);
      }

      return finalizeDeploy;
    }()
  }, {
    key: "log",
    value: function log(msg) {
      this.serverless.cli.log("[LayersPlugin]: ".concat(msg));
    }
  }, {
    key: "warn",
    value: function warn(msg) {
      this.serverless.cli.log(chalk.yellowBright("[LayersPlugin]: ".concat(msg)));
    }
  }, {
    key: "error",
    value: function error(msg) {
      this.serverless.cli.log(chalk.red("[LayersPlugin]: ".concat(msg)));
    }
  }, {
    key: "cleanUpLayers",
    value: function cleanUpLayers() {
      return this.layersService.cleanUpLayers();
    }
  }]);
  return ServerlessLayers;
}();

module.exports = ServerlessLayers;
//# sourceMappingURL=index.js.map