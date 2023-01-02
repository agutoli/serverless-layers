"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArtifactoryS3BucketService = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var AWS = _interopRequireWildcard(require("aws-sdk"));

var fs = require('fs');

var ArtifactoryS3BucketService = /*#__PURE__*/function () {
  function ArtifactoryS3BucketService(serverlessLayersConfig) {
    (0, _classCallCheck2["default"])(this, ArtifactoryS3BucketService);
    this.serverlessLayersConfig = serverlessLayersConfig;
    this.s3Client = {};
  }

  (0, _createClass2["default"])(ArtifactoryS3BucketService, [{
    key: "initService",
    value: function initService() {
      this.s3Client = new AWS.S3({
        region: this.serverlessLayersConfig.artifactoryRegion,
        credentials: {
          accessKeyId: this.serverlessLayersConfig.s3ArtifactoryAccessKeyId,
          secretAccessKey: this.serverlessLayersConfig.s3ArtifactorySecretAccessKey,
          sessionToken: this.serverlessLayersConfig.s3ArtifactorySessionToken
        }
      });
    }
  }, {
    key: "downloadLayerHashMappingJsonFile",
    value: function () {
      var _downloadLayerHashMappingJsonFile = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var params, response;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.debug("[ LayersPlugin - Artifacts ]: going to download hash mapping file - key ".concat(this.serverlessLayersConfig.artifactoryJsonMappingKey, " from bucket ").concat(this.serverlessLayersConfig.artifactoryBucketName, " in region ").concat(this.s3Client.config.region, " and endpoint ").concat(this.s3Client.config.endpoint));
                _context.prev = 1;
                params = {
                  Bucket: this.serverlessLayersConfig.artifactoryBucketName,
                  Key: this.serverlessLayersConfig.artifactoryJsonMappingKey
                };
                _context.next = 5;
                return this.s3Client.getObject(params).promise();

              case 5:
                response = _context.sent;
                return _context.abrupt("return", JSON.parse(response.Body.toString()).layerInfo.layerArn);

              case 9:
                _context.prev = 9;
                _context.t0 = _context["catch"](1);

                if (!(_context.t0.code === 'NoSuchKey')) {
                  _context.next = 14;
                  break;
                }

                console.debug("[ LayersPlugin - Artifacts ]: key ".concat(this.serverlessLayersConfig.artifactoryJsonMappingKey, " was not found in bucket ").concat(this.serverlessLayersConfig.artifactoryBucketName));
                return _context.abrupt("return", undefined);

              case 14:
                console.error("[ LayersPlugin - Artifacts ]: could not query bucket ".concat(this.serverlessLayersConfig.artifactoryBucketName, " for key ").concat(this.serverlessLayersConfig.artifactoryJsonMappingKey), _context.t0);
                throw _context.t0;

              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 9]]);
      }));

      function downloadLayerHashMappingJsonFile() {
        return _downloadLayerHashMappingJsonFile.apply(this, arguments);
      }

      return downloadLayerHashMappingJsonFile;
    }()
  }, {
    key: "uploadLayerHashMappingFile",
    value: function () {
      var _uploadLayerHashMappingFile = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(layerArn) {
        var params, response;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.debug("[ LayersPlugin - Artifacts ]: going to upload hash mapping file - key ".concat(this.serverlessLayersConfig.artifactoryJsonMappingKey, " for bucket ").concat(this.serverlessLayersConfig.artifactoryBucketName));
                params = {
                  Bucket: this.serverlessLayersConfig.artifactoryBucketName,
                  Key: this.serverlessLayersConfig.artifactoryJsonMappingKey,
                  Body: this.generateHashMappingFileContent(layerArn),
                  ContentType: 'application/zip'
                };
                _context2.next = 4;
                return this.s3Client.putObject(params).promise();

              case 4:
                response = _context2.sent;
                console.debug("[ LayersPlugin - Artifacts ]: file ".concat(this.serverlessLayersConfig.artifactoryJsonMappingKey, " was successfully uploaded to ").concat(this.serverlessLayersConfig.artifactoryBucketName, ", response is: ").concat(JSON.stringify(response)));

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function uploadLayerHashMappingFile(_x) {
        return _uploadLayerHashMappingFile.apply(this, arguments);
      }

      return uploadLayerHashMappingFile;
    }()
  }, {
    key: "generateHashMappingFileContent",
    value: function generateHashMappingFileContent(layerArn) {
      return JSON.stringify({
        layerInfo: {
          packagesHash: this.serverlessLayersConfig.artifactoryHashKey,
          layerArn: layerArn
        }
      });
    }
  }, {
    key: "uploadLayerZipFile",
    value: function () {
      var _uploadLayerZipFile = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        var zipFile, params, response;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                console.debug("[ LayersPlugin - Artifacts ]: going to upload file ".concat(this.serverlessLayersConfig.tempArtifactoryZipFileName, " to ").concat(this.serverlessLayersConfig.artifactoryBucketName, " bucket for key ").concat(this.serverlessLayersConfig.artifactoryZipKey));
                _context3.next = 3;
                return fs.createReadStream(this.serverlessLayersConfig.tempArtifactoryZipFileName);

              case 3:
                zipFile = _context3.sent;
                params = {
                  Bucket: this.serverlessLayersConfig.artifactoryBucketName,
                  Key: this.serverlessLayersConfig.artifactoryZipKey,
                  Body: zipFile,
                  ContentType: 'application/zip'
                };
                _context3.next = 7;
                return this.s3Client.putObject(params).promise();

              case 7:
                response = _context3.sent;
                console.debug("[ LayersPlugin - Artifacts ]: file ".concat(this.serverlessLayersConfig.artifactoryZipKey, " was uploaded to ").concat(this.serverlessLayersConfig.artifactoryBucketName, ", response is: ").concat(JSON.stringify(response)));

              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function uploadLayerZipFile() {
        return _uploadLayerZipFile.apply(this, arguments);
      }

      return uploadLayerZipFile;
    }()
  }]);
  return ArtifactoryS3BucketService;
}();

exports.ArtifactoryS3BucketService = ArtifactoryS3BucketService;
//# sourceMappingURL=ArtifactoryS3BucketService.js.map