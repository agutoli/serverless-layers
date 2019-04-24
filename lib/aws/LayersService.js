"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AbstractService = require('../AbstractService');

var LayersService =
/*#__PURE__*/
function (_AbstractService) {
  (0, _inherits2["default"])(LayersService, _AbstractService);

  function LayersService() {
    (0, _classCallCheck2["default"])(this, LayersService);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(LayersService).apply(this, arguments));
  }

  (0, _createClass2["default"])(LayersService, [{
    key: "publishVersion",
    value: function () {
      var _publishVersion = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
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
                  LayerName: this.stackName,
                  Description: 'created by serverless-layers plugin',
                  CompatibleRuntimes: this.plugin.settings.compatibleRuntimes
                };
                return _context.abrupt("return", this.provider.request('Lambda', 'publishLayerVersion', params).then(function (result) {
                  _this.plugin.log('New layer version published...');

                  _this.plugin.cacheObject.LayerVersionArn = result.LayerVersionArn;
                  return result;
                })["catch"](function (e) {
                  console.log(e.message);
                  process.exit(1);
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
  }]);
  return LayersService;
}(AbstractService);

module.exports = LayersService;
//# sourceMappingURL=LayersService.js.map