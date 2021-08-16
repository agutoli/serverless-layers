"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var chalk = require('chalk');

var path = require('path');

var AbstractService = /*#__PURE__*/function () {
  function AbstractService(plugin) {
    (0, _classCallCheck2["default"])(this, AbstractService);
    this.plugin = plugin;
    this.functionName = plugin.currentLayerName;
    this.stackName = plugin.getStackName();
    this.layerName = plugin.getLayerName();
    this.bucketName = plugin.getBucketName();
    this.provider = this.plugin.provider;
    this.dependenceFilename = path.join(plugin.getBucketLayersPath(), this.plugin.settings.dependenciesPath);
    this.zipFileKeyName = "".concat(path.join(this.plugin.getBucketLayersPath(), this.layerName), ".zip");

    if (/^win/.test(process.platform)) {
      this.zipFileKeyName = this.zipFileKeyName.replace(/\\/g, '/');
      this.dependenceFilename = this.dependenceFilename.replace(/\\/g, '/');
    }
  }

  (0, _createClass2["default"])(AbstractService, [{
    key: "awsRequest",
    value: function () {
      var _awsRequest = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(serviceAction, params) {
        var opts,
            _serviceAction$split,
            _serviceAction$split2,
            service,
            action,
            resp,
            _args = arguments;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                opts = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
                _serviceAction$split = serviceAction.split(':'), _serviceAction$split2 = (0, _slicedToArray2["default"])(_serviceAction$split, 2), service = _serviceAction$split2[0], action = _serviceAction$split2[1];

                if (opts.checkError) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt("return", this.provider.request(service, action, params));

              case 4:
                _context.prev = 4;
                _context.next = 7;
                return this.provider.request(service, action, params);

              case 7:
                resp = _context.sent;
                return _context.abrupt("return", resp);

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](4);
                console.log(chalk.red("ServerlessLayers error:"));
                console.log("    Action: ".concat(serviceAction));
                console.log("    Params: ".concat(JSON.stringify(params)));
                console.log(chalk.red("AWS SDK error:"));
                console.log("    ".concat(_context.t0.message));
                process.exit(1);

              case 19:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 11]]);
      }));

      function awsRequest(_x, _x2) {
        return _awsRequest.apply(this, arguments);
      }

      return awsRequest;
    }()
  }, {
    key: "getLayerPackageDir",
    value: function getLayerPackageDir() {
      var _this$plugin$settings = this.plugin.settings,
          compileDir = _this$plugin$settings.compileDir,
          runtimeDir = _this$plugin$settings.runtimeDir;
      return path.join(process.cwd(), compileDir, 'layers', runtimeDir);
      ;
    }
  }]);
  return AbstractService;
}();

module.exports = AbstractService;
//# sourceMappingURL=AbstractService.js.map