"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArtifactoryLayerService = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var AWS = _interopRequireWildcard(require("aws-sdk"));

var ArtifactoryLayerService = /*#__PURE__*/function () {
  function ArtifactoryLayerService(serverlessLayersConfig, compatibleRuntimes) {
    (0, _classCallCheck2["default"])(this, ArtifactoryLayerService);
    this.serverlessLayersConfig = serverlessLayersConfig;
    this.compatibleRuntimes = compatibleRuntimes;
  }

  (0, _createClass2["default"])(ArtifactoryLayerService, [{
    key: "initService",
    value: function initService() {
      this.lambdaLayerClient = new AWS.Lambda({
        region: this.serverlessLayersConfig.artifactoryRegion,
        credentials: {
          accessKeyId: this.serverlessLayersConfig.s3ArtifactoryAccessKeyId,
          secretAccessKey: this.serverlessLayersConfig.s3ArtifactorySecretAccessKey,
          sessionToken: this.serverlessLayersConfig.s3ArtifactorySessionToken
        }
      });
    }
  }, {
    key: "publishLayerFromArtifactory",
    value: function () {
      var _publishLayerFromArtifactory = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var params, response;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log("[ LayersPlugin - Artifacts ]: going to publish new layer version from artifactory, layer zip is in bucket ".concat(this.serverlessLayersConfig.artifactoryBucketName, " and zip key is ").concat(this.serverlessLayersConfig.artifactoryZipKey, ", layer name is ").concat(this.serverlessLayersConfig.artifactoryLayerName, " for the following runtimes ").concat(this.compatibleRuntimes));
                params = {
                  Content: {
                    S3Bucket: this.serverlessLayersConfig.artifactoryBucketName,
                    S3Key: this.serverlessLayersConfig.artifactoryZipKey
                  },
                  LayerName: this.serverlessLayersConfig.artifactoryLayerName,
                  Description: 'created by serverless-layers plugin from artifactory',
                  CompatibleRuntimes: this.compatibleRuntimes
                };
                _context.next = 4;
                return this.lambdaLayerClient.publishLayerVersion(params).promise();

              case 4:
                response = _context.sent;
                console.log("[ LayersPlugin - Artifacts ]: new layer version published, response is - ".concat(JSON.stringify(response)));
                _context.next = 8;
                return this.addLayerVersionPermissionForAwsAccountInTheSameRegion(response.LayerArn, response.Version);

              case 8:
                return _context.abrupt("return", response.LayerVersionArn);

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function publishLayerFromArtifactory() {
        return _publishLayerFromArtifactory.apply(this, arguments);
      }

      return publishLayerFromArtifactory;
    }()
  }, {
    key: "addLayerVersionPermissionForAwsAccountInTheSameRegion",
    value: function () {
      var _addLayerVersionPermissionForAwsAccountInTheSameRegion = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(layerArn, versionNumber) {
        var response;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log("[ LayersPlugin - Artifacts ]: going to add layer version permissions for layer arn ".concat(layerArn, " and version number ").concat(versionNumber, " for region ").concat(this.serverlessLayersConfig.artifactoryRegion));
                _context2.next = 3;
                return this.lambdaLayerClient.addLayerVersionPermission({
                  LayerName: layerArn,
                  VersionNumber: versionNumber,
                  StatementId: "layer-version-permission-for-".concat(this.serverlessLayersConfig.artifactoryRegion),
                  Action: 'lambda:GetLayerVersion',
                  Principal: '*',
                  OrganizationId: this.serverlessLayersConfig.organizationId
                }).promise();

              case 3:
                response = _context2.sent;
                console.log("[ LayersPlugin - Artifacts ]: new permission was added for layer ".concat(layerArn, " in ").concat(this.serverlessLayersConfig.artifactoryRegion, ", response is - ").concat(JSON.stringify(response)));

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function addLayerVersionPermissionForAwsAccountInTheSameRegion(_x, _x2) {
        return _addLayerVersionPermissionForAwsAccountInTheSameRegion.apply(this, arguments);
      }

      return addLayerVersionPermissionForAwsAccountInTheSameRegion;
    }()
  }]);
  return ArtifactoryLayerService;
}();

exports.ArtifactoryLayerService = ArtifactoryLayerService;
//# sourceMappingURL=ArtifactoryLayerService.js.map