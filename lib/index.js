"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var BbPromise = require('bluebird');

var path = require('path');

var slugify = require('slugify');

var chalk = require('chalk');

var semver = require('semver');

var Runtimes = require('./runtimes');

var LayersService = require('./aws/LayersService');

var BucketService = require('./aws/BucketService');

var CloudFormationService = require('./aws/CloudFormationService');

var ZipService = require('./package/ZipService');

var LocalFolders = require('./package/LocalFolders');

var Dependencies = require('./package/Dependencies');

var _require = require('./config/ServerlessLayersConfig'),
    ServerlessLayersConfig = _require.ServerlessLayersConfig;

var _require2 = require('./artifactory/ArtifactoryService'),
    ArtifactoryService = _require2.ArtifactoryService;

var ServerlessLayers = /*#__PURE__*/function () {
  function ServerlessLayers(serverless, options) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, ServerlessLayers);
    this.cacheObject = {};
    this.options = options;
    this.serverless = serverless;
    this.initialized = false;
    this.slsLayersConfig = new ServerlessLayersConfig(options); // hooks

    this.hooks = {
      'before:package:function:package': function beforePackageFunctionPackage() {
        return BbPromise.bind(_this).then(function () {
          return _this.init().then(function () {
            return _this.deployLayers();
          });
        });
      },
      'before:package:initialize': function beforePackageInitialize() {
        return BbPromise.bind(_this).then(function () {
          return _this.init().then(function () {
            return _this.deployLayers();
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
      'after:deploy:function:deploy': function afterDeployFunctionDeploy() {
        return BbPromise.bind(_this).then(function () {
          return _this.init();
        }).then(function () {
          return _this.finalizeDeploy();
        });
      },
      'plugin:uninstall:uninstall': function pluginUninstallUninstall() {
        return BbPromise.bind(_this).then(function () {
          return _this.init().then(function () {
            return _this.cleanUpAllLayers();
          });
        });
      },
      'remove:remove': function removeRemove() {
        return BbPromise.bind(_this).then(function () {
          return _this.init().then(function () {
            return _this.cleanUpAllLayers();
          });
        });
      }
    };
  }

  (0, _createClass2["default"])(ServerlessLayers, [{
    key: "init",
    value: function () {
      var _init = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
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
                version = this.serverless.getVersion();

                if (semver.lt(version, '1.34.0')) {
                  this.log("Error: Please install serverless >= 1.34.0 (current ".concat(this.serverless.getVersion(), ")"));
                  process.exit(1);
                }

              case 9:
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
    key: "deployLayers",
    value: function () {
      var _deployLayers = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var settings, cliOpts, layerName, currentSettings, enabledFuncs, deploySingle;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.runtimes = new Runtimes(this);
                settings = this.getSettings();
                cliOpts = this.provider.options;
                _context2.t0 = _regenerator["default"].keys(settings);

              case 4:
                if ((_context2.t1 = _context2.t0()).done) {
                  _context2.next = 18;
                  break;
                }

                layerName = _context2.t1.value;
                currentSettings = settings[layerName];
                enabledFuncs = currentSettings.functions; // deploying a single function

                deploySingle = !!(cliOpts["function"] && enabledFuncs); // skip layers that is not related with specified function

                if (!(deploySingle && enabledFuncs.indexOf(cliOpts["function"]) === -1)) {
                  _context2.next = 11;
                  break;
                }

                return _context2.abrupt("continue", 4);

              case 11:
                this.logGroup(layerName);
                _context2.next = 14;
                return this.initServices(layerName, currentSettings);

              case 14:
                _context2.next = 16;
                return this.main();

              case 16:
                _context2.next = 4;
                break;

              case 18:
                console.log('\n');

              case 19:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function deployLayers() {
        return _deployLayers.apply(this, arguments);
      }

      return deployLayers;
    }()
  }, {
    key: "cleanUpAllLayers",
    value: function () {
      var _cleanUpAllLayers = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        var settings, layerName, currentSettings;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.runtimes = new Runtimes(this);
                settings = this.getSettings();
                _context3.t0 = _regenerator["default"].keys(settings);

              case 3:
                if ((_context3.t1 = _context3.t0()).done) {
                  _context3.next = 16;
                  break;
                }

                layerName = _context3.t1.value;
                currentSettings = settings[layerName];
                this.logGroup(layerName);

                if (!currentSettings.arn) {
                  _context3.next = 10;
                  break;
                }

                this.warn(" (skipped) arn: ".concat(currentSettings.arn));
                return _context3.abrupt("continue", 3);

              case 10:
                _context3.next = 12;
                return this.initServices(layerName, currentSettings);

              case 12:
                _context3.next = 14;
                return this.cleanUpLayers();

              case 14:
                _context3.next = 3;
                break;

              case 16:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function cleanUpAllLayers() {
        return _cleanUpAllLayers.apply(this, arguments);
      }

      return cleanUpAllLayers;
    }()
  }, {
    key: "initServices",
    value: function () {
      var _initServices = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(layerName, settings) {
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.currentLayerName = layerName;
                this.settings = settings;
                this.zipService = new ZipService(this);
                this.dependencies = new Dependencies(this);
                this.localFolders = new LocalFolders(this);
                this.layersService = new LayersService(this);
                this.bucketService = new BucketService(this);
                this.cloudFormationService = new CloudFormationService(this);
                this.slsLayersConfig.init(this);
                this.artifactoryLayerService = new ArtifactoryService(this.slsLayersConfig, this.zipService, this);
                this.initialized = true;

              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function initServices(_x, _x2) {
        return _initServices.apply(this, arguments);
      }

      return initServices;
    }()
  }, {
    key: "mergeCommonSettings",
    value: function mergeCommonSettings(inboundSetting) {
      return _objectSpread({
        path: '.',
        functions: null,
        forceInstall: false,
        dependencyInstall: true,
        compileDir: '.serverless',
        customInstallationCommand: null,
        layersDeploymentBucket: this.service.provider.deploymentBucket
      }, this.runtimes.getDefaultSettings(inboundSetting));
    }
  }, {
    key: "getSettings",
    value: function getSettings() {
      var _this2 = this;

      var inboundSettings = (this.serverless.service.custom || {})['serverless-layers'];

      if (Array.isArray(inboundSettings)) {
        var settings = {};
        inboundSettings.forEach(function (inboundSetting) {
          var layerName = Object.keys(inboundSetting)[0];
          settings[layerName] = _this2.mergeCommonSettings(inboundSetting[layerName]);
        });
        return settings;
      }

      return {
        "default": this.mergeCommonSettings(inboundSettings)
      };
    }
  }, {
    key: "hasSettingsChanges",
    value: function hasSettingsChanges() {
      var _this3 = this;

      // don't check settings changes twice
      if (this.hasSettingsVerified) {
        return false;
      } // by pass settings


      if (!this.settings.localDir) {
        return false;
      }

      var manifest = '__meta__/manifest-settings.json';
      var currentSettings = JSON.stringify(this.settings); // settings checked

      this.hasSettingsVerified = true;
      return this.bucketService.getFile(manifest).then(function (remoteSettings) {
        // create and return true (changed)
        if (!remoteSettings) {
          return _this3.bucketService.putFile(manifest, currentSettings).then(function () {
            return true;
          });
        }

        if (remoteSettings !== currentSettings) {
          return _this3.bucketService.putFile(manifest, currentSettings).then(function () {
            return true;
          });
        }

        return false;
      });
    }
  }, {
    key: "hasCustomHashChanged",
    value: function () {
      var _hasCustomHashChanged = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
        var hashFileName, remoteHashFile, _JSON$parse, remoteHash;

        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (this.settings.customHash) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt("return", false);

              case 2:
                hashFileName = 'customHash.json';
                _context5.next = 5;
                return this.bucketService.getFile(hashFileName);

              case 5:
                remoteHashFile = _context5.sent;

                if (remoteHashFile) {
                  _context5.next = 11;
                  break;
                }

                this.log('no previous custom hash found, putting new remote hash');
                _context5.next = 10;
                return this.bucketService.putFile(hashFileName, JSON.stringify({
                  hash: this.settings.customHash
                }));

              case 10:
                return _context5.abrupt("return", true);

              case 11:
                _JSON$parse = JSON.parse(remoteHashFile), remoteHash = _JSON$parse.hash;

                if (!(remoteHash === this.settings.customHash)) {
                  _context5.next = 14;
                  break;
                }

                return _context5.abrupt("return", false);

              case 14:
                _context5.next = 16;
                return this.bucketService.putFile(hashFileName, JSON.stringify({
                  hash: this.settings.customHash
                }));

              case 16:
                this.log('identified custom hash change!');
                return _context5.abrupt("return", true);

              case 18:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function hasCustomHashChanged() {
        return _hasCustomHashChanged.apply(this, arguments);
      }

      return hasCustomHashChanged;
    }()
  }, {
    key: "main",
    value: function () {
      var _main = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
        var _this$settings, arn, localDir, artifact, forceInstall, dependencyInstall, hasSettingsChanges, hasFoldersChanges, hasDepsChanges, hasZipChanged, hashCustomHashChanged, verifyChanges, existentLayerArn, skipInstallation, layerVersionArn, layerName, version;

        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _this$settings = this.settings, arn = _this$settings.arn, localDir = _this$settings.localDir, artifact = _this$settings.artifact, forceInstall = _this$settings.forceInstall, dependencyInstall = _this$settings.dependencyInstall; // static ARN

                if (!arn) {
                  _context6.next = 4;
                  break;
                }

                this.relateLayerWithFunctions(arn);
                return _context6.abrupt("return");

              case 4:
                _context6.next = 6;
                return this.runtimes.init();

              case 6:
                _context6.next = 8;
                return this.dependencies.init();

              case 8:
                _context6.next = 10;
                return this.localFolders.init();

              case 10:
                _context6.next = 12;
                return this.hasSettingsChanges();

              case 12:
                hasSettingsChanges = _context6.sent;
                // check if directories content has changed
                // comparing hash md5 remote with local folder
                hasFoldersChanges = false;

                if (!localDir) {
                  _context6.next = 18;
                  break;
                }

                _context6.next = 17;
                return this.localFolders.hasFoldersChanges();

              case 17:
                hasFoldersChanges = _context6.sent;

              case 18:
                // check if dependencies has changed comparing
                // remote package.json with local one
                hasDepsChanges = false;

                if (!dependencyInstall) {
                  _context6.next = 23;
                  break;
                }

                _context6.next = 22;
                return this.runtimes.hasDependenciesChanges();

              case 22:
                hasDepsChanges = _context6.sent;

              case 23:
                hasZipChanged = false;

                if (!artifact) {
                  _context6.next = 28;
                  break;
                }

                _context6.next = 27;
                return this.zipService.hasZipChanged();

              case 27:
                hasZipChanged = _context6.sent;

              case 28:
                _context6.next = 30;
                return this.hasCustomHashChanged();

              case 30:
                hashCustomHashChanged = _context6.sent;
                // It checks if something has changed
                verifyChanges = [hasZipChanged, hasDepsChanges, hasFoldersChanges, hasSettingsChanges, hashCustomHashChanged].some(function (x) {
                  return x === true;
                }); // merge package default options

                this.mergePackageOptions(); // It returns the layer arn if exists.

                _context6.next = 35;
                return this.getLayerArn();

              case 35:
                existentLayerArn = _context6.sent;
                // It improves readability
                skipInstallation = !verifyChanges && !forceInstall && existentLayerArn;
                /**
                 * If no changes, and layer arn available,
                 * it doesn't require re-installing dependencies.
                 */

                if (!skipInstallation) {
                  _context6.next = 41;
                  break;
                }

                this.log("".concat(chalk.inverse.green(' No changes '), "! Using same layer arn: ").concat(this.logArn(existentLayerArn)));
                this.relateLayerWithFunctions(existentLayerArn);
                return _context6.abrupt("return");

              case 41:
                if (!(dependencyInstall && !artifact)) {
                  _context6.next = 44;
                  break;
                }

                _context6.next = 44;
                return this.dependencies.install();

              case 44:
                if (!(localDir && !artifact)) {
                  _context6.next = 47;
                  break;
                }

                _context6.next = 47;
                return this.localFolders.copyFolders();

              case 47:
                layerVersionArn = '';
                layerName = this.getLayerName();

                if (!this.slsLayersConfig.shouldUseLayersArtifactory) {
                  _context6.next = 56;
                  break;
                }

                _context6.next = 52;
                return this.artifactoryLayerService.updateLayerFromArtifactory();

              case 52:
                layerVersionArn = _context6.sent;
                layerName = this.slsLayersConfig.artifactoryLayerName;
                _context6.next = 64;
                break;

              case 56:
                _context6.next = 58;
                return this.zipService["package"]();

              case 58:
                _context6.next = 60;
                return this.bucketService.uploadZipFile();

              case 60:
                _context6.next = 62;
                return this.layersService.publishVersion();

              case 62:
                version = _context6.sent;
                layerVersionArn = version.LayerVersionArn;

              case 64:
                _context6.next = 66;
                return this.bucketService.putFile(this.dependencies.getDepsPath());

              case 66:
                _context6.next = 68;
                return this.bucketService.putFile(this.settings.dependenciesLockPath);

              case 68:
                this.relateLayerWithFunctions(layerVersionArn, layerName);

              case 69:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function main() {
        return _main.apply(this, arguments);
      }

      return main;
    }()
  }, {
    key: "getLayerName",
    value: function getLayerName() {
      var stackName = this.getStackName();
      console.log("[ LayersPlugin ]: going to generate layer name, stackName is - ".concat(stackName));
      var runtimeDir = this.settings.runtimeDir;
      return slugify("".concat(stackName, "-").concat(runtimeDir, "-").concat(this.currentLayerName), {
        lower: true,
        replacement: '-'
      });
    }
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
      if (this.settings.artifact) {
        return "".concat(path.join(process.cwd(), this.settings.artifact));
      }

      return "".concat(path.join(process.cwd(), this.settings.compileDir, this.getLayerName()), ".zip");
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
      var _getLayerArn = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
        var outputs, logicalId, arn;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!this.cacheObject.layersArn) {
                  this.cacheObject.layersArn = {};
                } // returns cached arn


                if (!this.cacheObject.layersArn[this.currentLayerName]) {
                  _context7.next = 3;
                  break;
                }

                return _context7.abrupt("return", this.cacheObject.layersArn[this.currentLayerName]);

              case 3:
                _context7.next = 5;
                return this.cloudFormationService.getOutputs();

              case 5:
                outputs = _context7.sent;

                if (outputs) {
                  _context7.next = 8;
                  break;
                }

                return _context7.abrupt("return", null);

              case 8:
                logicalId = this.getOutputLogicalId(this.getLayerName());
                arn = (outputs.find(function (x) {
                  return x.OutputKey === logicalId;
                }) || {}).OutputValue; // cache arn

                this.cacheObject.layersArn[this.currentLayerName] = arn;
                return _context7.abrupt("return", arn);

              case 12:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function getLayerArn() {
        return _getLayerArn.apply(this, arguments);
      }

      return getLayerArn;
    }()
  }, {
    key: "getOutputLogicalId",
    value: function getOutputLogicalId(layerName) {
      return this.provider.naming.getLambdaLayerOutputLogicalId(layerName);
    }
  }, {
    key: "mergePackageOptions",
    value: function mergePackageOptions() {
      var _this$settings2 = this.settings,
          packageExclude = _this$settings2.packageExclude,
          artifact = _this$settings2.artifact;
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

      if (artifact) {
        this.service["package"].exclude.push(artifact);
      }
    }
  }, {
    key: "relateLayerWithFunctions",
    value: function relateLayerWithFunctions(layerArn) {
      var _this4 = this;

      var layerName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getLayerName();
      console.log("[ LayersPlugin ]: going to relate layer with functions, layer arn: - ".concat(layerArn, ", layer name - ").concat(layerName));
      this.log('Adding layers...');
      var functions = this.service.functions;
      var funcs = this.settings.functions;
      var cliOpts = this.provider.options;
      Object.keys(functions).forEach(function (funcName) {
        if (cliOpts["function"] && cliOpts["function"] !== funcName) {
          return;
        }

        var isEnabled = !funcs;

        if (Array.isArray(funcs) && funcs.indexOf(funcName) !== -1) {
          isEnabled = true;
        }

        if (isEnabled) {
          functions[funcName].layers = functions[funcName].layers || [];
          functions[funcName].layers.push(layerArn);
          functions[funcName].layers = Array.from(new Set(functions[funcName].layers));

          _this4.log("function.".concat(chalk.magenta.bold(funcName), " - ").concat(_this4.logArn(layerArn)), ' ✓');
        } else {
          _this4.warn("(Skipped) function.".concat(chalk.magenta.bold(funcName)), ' x');
        }
      });
      this.service.resources = this.service.resources || {};
      this.service.resources.Outputs = this.service.resources.Outputs || {};
      var outputName = this.getOutputLogicalId(layerName);
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
      var _this5 = this;

      return Object.keys(this.localPackage.dependencies || []).map(function (x) {
        return "".concat(x, "@").concat(_this5.localPackage.dependencies[x]);
      });
    }
  }, {
    key: "finalizeDeploy",
    value: function () {
      var _finalizeDeploy = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
        var _this6 = this;

        var cliOpts;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                cliOpts = this.provider.options;
                this.logGroup('Layers Info');
                Object.keys(this.service.functions).forEach(function (funcName) {
                  var lambdaFunc = _this6.service.functions[funcName];
                  var layers = lambdaFunc.layers || [];

                  if (!cliOpts["function"] && layers.length === 0) {
                    _this6.warn("(skipped) function.".concat(chalk.magenta.bold(funcName)));

                    return;
                  }

                  layers.forEach(function (currentLayerARN) {
                    if (cliOpts["function"] && cliOpts["function"] === funcName) {
                      _this6.log("function.".concat(chalk.magenta.bold(funcName), " = layers.").concat(_this6.logArn(currentLayerARN)));

                      return;
                    }

                    _this6.log("function.".concat(chalk.magenta.bold(funcName), " = layers.").concat(_this6.logArn(currentLayerARN)));
                  });
                });
                console.log('\n');

              case 4:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function finalizeDeploy() {
        return _finalizeDeploy.apply(this, arguments);
      }

      return finalizeDeploy;
    }()
  }, {
    key: "log",
    value: function log(msg) {
      var signal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ' ○';
      console.log('...' + "".concat(chalk.greenBright.bold(signal), " ").concat(chalk.white(msg)));
    }
  }, {
    key: "logGroup",
    value: function logGroup(msg) {
      console.log('\n');
      this.serverless.cli.log("[ LayersPlugin ]: ".concat(chalk.magenta.bold('=>'), " ").concat(chalk.greenBright.bold(msg)));
    }
  }, {
    key: "warn",
    value: function warn(msg) {
      var signal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ' ∅';
      console.log("...".concat(chalk.yellowBright("".concat(chalk.yellowBright.bold(signal), " ").concat(msg))));
    }
  }, {
    key: "error",
    value: function error(msg) {
      var signal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ' ⊗';
      console.log("...".concat(chalk.red("".concat(signal, " ").concat(chalk.white.bold(msg)))));
    }
  }, {
    key: "cleanUpLayers",
    value: function cleanUpLayers() {
      return this.layersService.cleanUpLayers();
    }
  }, {
    key: "logArn",
    value: function logArn(arn) {
      var pattern = /arn:aws:lambda:([^:]+):([0-9]+):layer:([^:]+):([0-9]+)/g;
      var region = chalk.bold('$1');
      var name = chalk.magenta('$3');
      var formated = chalk.white("arn:aws:lambda:".concat(region, ":*********:").concat(name, ":$4"));
      var text = '';

      switch ((0, _typeof2["default"])(arn)) {
        case 'object':
          if (arn.Ref) {
            text = "logicalId:[".concat(chalk.bold('Ref'), "=");
            text += "".concat(chalk.magenta(arn.Ref), "]");
          }

          break;

        case 'string':
          text = arn;
          break;

        default:
          text = String(arn);
          break;
      }

      return text.replace(pattern, formated);
    }
  }]);
  return ServerlessLayers;
}();

module.exports = ServerlessLayers;
//# sourceMappingURL=index.js.map