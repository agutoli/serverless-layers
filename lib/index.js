"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var BbPromise = require('bluebird');

var install = require('npm-install-package');

var mkdirp = require('mkdirp');

var fs = require('fs');

var copyFile = require('fs-copy-file'); // v6.10.3 support


var path = require('path');

var archiver = require('archiver');

var MAX_LAYER_MB_SIZE = 250;

var ServerlessLayers =
/*#__PURE__*/
function () {
  function ServerlessLayers(serverless, options) {
    var _this = this;

    (0, _classCallCheck2.default)(this, ServerlessLayers);
    this.cacheObject = {};
    this.options = options;
    this.serverless = serverless;
    this.service = serverless.service;
    this.provider = serverless.getProvider('aws');
    this.options.region = this.provider.getRegion(); // bindings

    this.log = this.log.bind(this);
    this.main = this.main.bind(this); // hooks

    this.hooks = {
      'package:initialize': function packageInitialize() {
        return BbPromise.bind(_this).then(function () {
          return _this.main();
        });
      },
      'aws:info:displayLayers': function awsInfoDisplayLayers() {
        return BbPromise.bind(_this).then(function () {
          return _this.finalizeDeploy();
        });
      }
    };
    var inboundSettings = (serverless.service.custom || {})['serverless-layers'];
    var defaultSettings = {
      compileDir: '.serverless',
      packagePath: 'package.json'
    };
    this.settings = Object.assign({}, defaultSettings, inboundSettings);
    var localpackageJson = path.join(process.env.PWD, this.settings.packagePath);

    try {
      this.localPackage = require(localpackageJson);
    } catch (e) {
      this.log("Error: Can not find ".concat(localpackageJson, "!"));
      process.exit(1);
    }
  }

  (0, _createClass2.default)(ServerlessLayers, [{
    key: "getStackName",
    value: function getStackName() {
      return "".concat(this.serverless.service.service, "-").concat(this.options.stage);
    }
  }, {
    key: "getOutputs",
    value: function getOutputs() {
      var params = {
        StackName: this.getStackName()
      };
      return this.provider.request('CloudFormation', 'describeStacks', params).then(function (_ref) {
        var Stacks = _ref.Stacks;
        return Stacks && Stacks[0].Outputs;
      }).catch(function () {
        return [];
      });
    }
  }, {
    key: "getBucketName",
    value: function getBucketName() {
      if (!this.service.provider.deploymentBucket) {
        throw new Error('Please, you should specify "deploymentBucket" for this plugin!\n');
      }

      return this.service.provider.deploymentBucket;
    }
  }, {
    key: "publishLayerVersion",
    value: function () {
      var _publishLayerVersion = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        var _this2 = this;

        var bucketName, params;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.getBucketName();

              case 2:
                bucketName = _context.sent;
                params = {
                  Content: {
                    S3Bucket: bucketName,
                    S3Key: "".concat(path.join(this.getBucketLayersPath(), this.getStackName()), ".zip")
                  },
                  LayerName: this.getStackName(),
                  Description: 'created by serverless-layers',
                  CompatibleRuntimes: ['nodejs']
                };
                return _context.abrupt("return", this.provider.request('Lambda', 'publishLayerVersion', params).then(function (result) {
                  _this2.log('New layer version published...');

                  _this2.cacheObject.LayerVersionArn = result.LayerVersionArn;
                  return result;
                }).catch(function (e) {
                  console.log(e.message);
                  process.exit(1);
                }));

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function publishLayerVersion() {
        return _publishLayerVersion.apply(this, arguments);
      }

      return publishLayerVersion;
    }()
  }, {
    key: "getPathZipFileName",
    value: function getPathZipFileName() {
      return "".concat(path.join(process.cwd(), this.settings.compileDir, this.getStackName()), ".zip");
    }
  }, {
    key: "createPackageLayer",
    value: function createPackageLayer() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var layersDir = path.join(process.cwd(), _this3.settings.compileDir);
        var oldCwd = process.cwd();

        var zipFileName = _this3.getPathZipFileName();

        var output = fs.createWriteStream(zipFileName);
        var zip = archiver.create('zip');
        output.on('close', function () {
          var MB = (zip.pointer() / 1024 / 1024).toFixed(1);

          if (MB > MAX_LAYER_MB_SIZE) {
            _this3.log('Package error!');

            throw new Error('Layers can\'t exceed the unzipped deployment package size limit of 250 MB! \n' + 'Read more: https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html\n\n');
          }

          _this3.log("Created layer package ".concat(zipFileName, " (").concat(MB, " MB)"));

          resolve();
        });
        zip.on('error', function (err) {
          reject(err);
          process.chdir(oldCwd);
        });
        process.chdir(layersDir);
        zip.pipe(output);
        zip.directory('layers', false);
        zip.finalize().then(function () {
          process.chdir(oldCwd);
        });
      });
    }
  }, {
    key: "uploadPackageLayer",
    value: function () {
      var _uploadPackageLayer = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2() {
        var _this4 = this;

        var bucketName, params;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.log('Uploading layer package...');
                _context2.next = 3;
                return this.getBucketName();

              case 3:
                bucketName = _context2.sent;
                params = {
                  Bucket: bucketName,
                  Key: "".concat(path.join(this.getBucketLayersPath(), this.getStackName()), ".zip"),
                  Body: fs.createReadStream(this.getPathZipFileName())
                };
                return _context2.abrupt("return", this.provider.request('S3', 'putObject', params).then(function (result) {
                  _this4.log('OK...');

                  return result;
                }).catch(function (e) {
                  console.log(e.message);
                  process.exit(1);
                }));

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function uploadPackageLayer() {
        return _uploadPackageLayer.apply(this, arguments);
      }

      return uploadPackageLayer;
    }()
  }, {
    key: "uploadPackageJson",
    value: function () {
      var _uploadPackageJson = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3() {
        var _this5 = this;

        var bucketName, params;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.log('Uploading remote package.json...');
                _context3.next = 3;
                return this.getBucketName();

              case 3:
                bucketName = _context3.sent;
                params = {
                  Bucket: bucketName,
                  Key: path.join(this.getBucketLayersPath(), 'package.json'),
                  Body: fs.createReadStream(this.settings.packagePath)
                };
                return _context3.abrupt("return", this.provider.request('S3', 'putObject', params).then(function (result) {
                  _this5.log('OK...');

                  return result;
                }).catch(function (e) {
                  console.log(e.message);
                  process.exit(1);
                }));

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function uploadPackageJson() {
        return _uploadPackageJson.apply(this, arguments);
      }

      return uploadPackageJson;
    }()
  }, {
    key: "downloadPackageJson",
    value: function () {
      var _downloadPackageJson = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee4() {
        var _this6 = this;

        var bucketName, params;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.log('Downloading package.json from bucket...');
                _context4.next = 3;
                return this.getBucketName();

              case 3:
                bucketName = _context4.sent;
                params = {
                  Bucket: bucketName,
                  Key: path.join(this.getBucketLayersPath(), 'package.json')
                };
                return _context4.abrupt("return", this.provider.request('S3', 'getObject', params).then(function (result) {
                  return JSON.parse(result.Body.toString());
                }).catch(function () {
                  _this6.log('package.json does not exists at bucket...');

                  return null;
                }));

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function downloadPackageJson() {
        return _downloadPackageJson.apply(this, arguments);
      }

      return downloadPackageJson;
    }()
  }, {
    key: "getBucketLayersPath",
    value: function getBucketLayersPath() {
      var serviceStage = "".concat(this.serverless.service.service, "/").concat(this.options.stage);
      return path.join(this.provider.getDeploymentPrefix(), serviceStage, 'layers');
    }
  }, {
    key: "getLayerArn",
    value: function () {
      var _getLayerArn = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee5() {
        var outputs, logicalId;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!this.cacheObject.LayerVersionArn) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt("return", this.cacheObject.LayerVersionArn);

              case 2:
                _context5.next = 4;
                return this.getOutputs();

              case 4:
                outputs = _context5.sent;

                if (outputs) {
                  _context5.next = 7;
                  break;
                }

                return _context5.abrupt("return", null);

              case 7:
                logicalId = this.getOutputLogicalId();
                return _context5.abrupt("return", (outputs.find(function (x) {
                  return x.OutputKey === logicalId;
                }) || {}).OutputValue);

              case 9:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
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
    key: "relateLayerWithFunctions",
    value: function relateLayerWithFunctions(layerArn) {
      var _this7 = this;

      this.log('Associating layers...');
      var functions = this.service.functions;
      Object.keys(functions).forEach(function (funcName) {
        functions[funcName].layers = functions[funcName].layers || [];
        functions[funcName].layers.push(layerArn);

        _this7.log("function.".concat(funcName, " - ").concat(layerArn));
      });
      this.service.resources = this.service.resources || {};
      this.service.resources.Outputs = this.service.resources.Outputs || {};
      var outputName = this.getOutputLogicalId();
      Object.assign(this.service.resources.Outputs, (0, _defineProperty2.default)({}, outputName, {
        Value: layerArn,
        Export: {
          Name: outputName
        }
      }));
    }
  }, {
    key: "main",
    value: function () {
      var _main = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee6() {
        var remotePackage, isDifferent, currentLayerARN, version;
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                this.settings.layerName = this.settings.layerName || this.serverless.service.service;
                _context6.next = 3;
                return this.downloadPackageJson();

              case 3:
                remotePackage = _context6.sent;
                isDifferent = true;

                if (!remotePackage) {
                  _context6.next = 10;
                  break;
                }

                this.log('Comparing package.json dependencies...');
                _context6.next = 9;
                return this.isDiff(remotePackage.dependencies, this.localPackage.dependencies);

              case 9:
                isDifferent = _context6.sent;

              case 10:
                _context6.next = 12;
                return this.getLayerArn();

              case 12:
                currentLayerARN = _context6.sent;

                if (!(!isDifferent && currentLayerARN)) {
                  _context6.next = 17;
                  break;
                }

                this.log("Not has changed! Using same layer arn: ".concat(currentLayerARN));
                this.relateLayerWithFunctions(currentLayerARN);
                return _context6.abrupt("return");

              case 17:
                _context6.next = 19;
                return this.installDependencies();

              case 19:
                _context6.next = 21;
                return this.uploadPackageJson();

              case 21:
                _context6.next = 23;
                return this.createPackageLayer();

              case 23:
                _context6.next = 25;
                return this.uploadPackageLayer();

              case 25:
                _context6.next = 27;
                return this.publishLayerVersion();

              case 27:
                version = _context6.sent;
                this.relateLayerWithFunctions(version.LayerVersionArn);

              case 29:
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
    key: "isDiff",
    value: function isDiff(depsA, depsB) {
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
    key: "getDependenciesList",
    value: function getDependenciesList() {
      var _this8 = this;

      return Object.keys(this.localPackage.dependencies).map(function (x) {
        return "".concat(x, "@").concat(_this8.localPackage.dependencies[x]);
      });
    }
  }, {
    key: "installDependencies",
    value: function () {
      var _installDependencies = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee7() {
        var _this9 = this;

        var initialCwd, nodeJsDir;
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                this.log('Dependencies has changed! Re-installing...');
                initialCwd = process.cwd();
                nodeJsDir = path.join(process.cwd(), this.settings.compileDir, 'layers', 'nodejs');
                _context7.next = 5;
                return mkdirp.sync(nodeJsDir);

              case 5:
                return _context7.abrupt("return", new Promise(function (resolve) {
                  copyFile(_this9.settings.packagePath, path.join(nodeJsDir, 'package.json'), function (copyErr) {
                    if (copyErr) throw copyErr; // install deps

                    process.chdir(nodeJsDir);
                    var opts = {
                      saveDev: false,
                      cache: true,
                      silent: false
                    };
                    install(_this9.getDependenciesList(), opts, function (installErr) {
                      process.chdir(initialCwd);
                      if (installErr) throw installErr;
                      resolve();
                    });
                  });
                }));

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function installDependencies() {
        return _installDependencies.apply(this, arguments);
      }

      return installDependencies;
    }()
  }, {
    key: "finalizeDeploy",
    value: function () {
      var _finalizeDeploy = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee8() {
        var _this10 = this;

        var currentLayerARN;
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.getLayerArn();

              case 2:
                currentLayerARN = _context8.sent;
                Object.keys(this.service.functions).forEach(function (funcName) {
                  _this10.log("function.".concat(funcName, " = layers.").concat(currentLayerARN));
                });

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
      this.serverless.cli.log("[LayersPlugin]: ".concat(msg));
    }
  }]);
  return ServerlessLayers;
}();

module.exports = ServerlessLayers;
//# sourceMappingURL=index.js.map