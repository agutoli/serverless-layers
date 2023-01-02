"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArtifactoryService = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _require = require('./ArtifactoryS3BucketService'),
    ArtifactoryS3BucketService = _require.ArtifactoryS3BucketService;

var _require2 = require('./ArtifactoryLayerService'),
    ArtifactoryLayerService = _require2.ArtifactoryLayerService;

var ArtifactoryService = /*#__PURE__*/function () {
  function ArtifactoryService(serverlessLayersConfig, zipService, plugin) {
    (0, _classCallCheck2["default"])(this, ArtifactoryService);
    this.artifactoryS3BucketService = new ArtifactoryS3BucketService(serverlessLayersConfig);
    this.artifactoryLayerService = new ArtifactoryLayerService(serverlessLayersConfig, plugin.settings.compatibleRuntimes);
    this.tempArtifactoryZipFileName = serverlessLayersConfig.tempArtifactoryZipFileName;
    this.zipService = zipService;
  }

  (0, _createClass2["default"])(ArtifactoryService, [{
    key: "initServices",
    value: function initServices() {
      this.artifactoryS3BucketService.initService();
      this.artifactoryLayerService.initService();
    }
  }, {
    key: "updateLayerFromArtifactory",
    value: function () {
      var _updateLayerFromArtifactory = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var layerVersionArn;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log('[ LayersPlugin - Artifacts ]: going to update layer using artifactory');
                this.initServices();
                _context.next = 4;
                return this.artifactoryS3BucketService.downloadLayerHashMappingJsonFile();

              case 4:
                layerVersionArn = _context.sent;

                if (layerVersionArn) {
                  _context.next = 16;
                  break;
                }

                console.log('[ LayersPlugin - Artifacts ]: hash does not exist in the artifactory, going to add new layer');
                _context.next = 9;
                return this.zipService["package"](this.tempArtifactoryZipFileName);

              case 9:
                _context.next = 11;
                return this.artifactoryS3BucketService.uploadLayerZipFile();

              case 11:
                _context.next = 13;
                return this.artifactoryLayerService.publishLayerFromArtifactory();

              case 13:
                layerVersionArn = _context.sent;
                _context.next = 16;
                return this.artifactoryS3BucketService.uploadLayerHashMappingFile(layerVersionArn);

              case 16:
                return _context.abrupt("return", layerVersionArn);

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function updateLayerFromArtifactory() {
        return _updateLayerFromArtifactory.apply(this, arguments);
      }

      return updateLayerFromArtifactory;
    }()
  }]);
  return ArtifactoryService;
}();

exports.ArtifactoryService = ArtifactoryService;
//# sourceMappingURL=ArtifactoryService.js.map