"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var AbstractService = require('../AbstractService');

var LayersService = /*#__PURE__*/function (_AbstractService) {
  (0, _inherits2["default"])(LayersService, _AbstractService);

  var _super = _createSuper(LayersService);

  function LayersService() {
    (0, _classCallCheck2["default"])(this, LayersService);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(LayersService, [{
    key: "publishVersion",
    value: function () {
      var _publishVersion = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _this = this;

        var params;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                params = {
                  Content: {
                    S3Bucket: this.bucketName,
                    S3Key: this.zipFileKeyName
                  },
                  LayerName: this.layerName,
                  Description: 'created by serverless-layers plugin',
                  CompatibleRuntimes: this.plugin.settings.compatibleRuntimes,
                  CompatibleArchitectures: this.plugin.settings.compatibleArchitectures
                };
                return _context.abrupt("return", this.awsRequest('Lambda:publishLayerVersion', params, {
                  checkError: true
                }).then(function (result) {
                  _this.plugin.log('New layer version published...');

                  _this.plugin.cacheObject.LayerVersionArn = result.LayerVersionArn;
                  return result;
                }));

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function publishVersion() {
        return _publishVersion.apply(this, arguments);
      }

      return publishVersion;
    }()
  }, {
    key: "cleanUpLayers",
    value: function () {
      var _cleanUpLayers = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _this2 = this;

        var keepVersion,
            params,
            response,
            deletionCandidates,
            deleteQueue,
            _args2 = arguments;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                keepVersion = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 0;
                params = {
                  LayerName: this.layerName
                };
                _context2.next = 4;
                return this.awsRequest('Lambda:listLayerVersions', params, {
                  checkError: true
                });

              case 4:
                response = _context2.sent;

                if (!(response.LayerVersions.length <= keepVersion)) {
                  _context2.next = 8;
                  break;
                }

                this.plugin.log('Layers removal finished.\n');
                return _context2.abrupt("return");

              case 8:
                deletionCandidates = this.selectVersionsToDelete(response.LayerVersions, keepVersion);
                deleteQueue = deletionCandidates.map(function (layerVersion) {
                  _this2.plugin.log("Removing layer version: ".concat(layerVersion.Version));

                  return _this2.awsRequest('Lambda:deleteLayerVersion', {
                    LayerName: _this2.layerName,
                    VersionNumber: layerVersion.Version
                  }, {
                    checkError: true
                  });
                });
                _context2.next = 12;
                return Promise.all(deleteQueue);

              case 12:
                _context2.next = 14;
                return this.cleanUpLayers(keepVersion);

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function cleanUpLayers() {
        return _cleanUpLayers.apply(this, arguments);
      }

      return cleanUpLayers;
    }()
  }, {
    key: "selectVersionsToDelete",
    value: function selectVersionsToDelete(versions, keepVersion) {
      return versions.sort(function (a, b) {
        return parseInt(a.Version) === parseInt(b.Version) ? 0 : parseInt(a.Version) > parseInt(b.Version) ? -1 : 1;
      }).slice(keepVersion);
    }
  }]);
  return LayersService;
}(AbstractService);

module.exports = LayersService;
//# sourceMappingURL=LayersService.js.map