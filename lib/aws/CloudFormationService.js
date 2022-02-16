"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var AbstractService = require('../AbstractService');

var CloudFormationService = /*#__PURE__*/function (_AbstractService) {
  (0, _inherits2["default"])(CloudFormationService, _AbstractService);

  var _super = _createSuper(CloudFormationService);

  function CloudFormationService() {
    (0, _classCallCheck2["default"])(this, CloudFormationService);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(CloudFormationService, [{
    key: "getOutputs",
    value: function getOutputs() {
      var params = {
        StackName: this.stackName
      };
      return this.awsRequest('CloudFormation:describeStacks', params).then(function (_ref) {
        var Stacks = _ref.Stacks;
        return Stacks && Stacks[0].Outputs;
      })["catch"](function () {
        return [];
      });
    }
  }]);
  return CloudFormationService;
}(AbstractService);

module.exports = CloudFormationService;
//# sourceMappingURL=CloudFormationService.js.map