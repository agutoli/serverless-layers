"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AbstractService = require('../AbstractService');

var CloudFormationService =
/*#__PURE__*/
function (_AbstractService) {
  (0, _inherits2["default"])(CloudFormationService, _AbstractService);

  function CloudFormationService() {
    (0, _classCallCheck2["default"])(this, CloudFormationService);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(CloudFormationService).apply(this, arguments));
  }

  (0, _createClass2["default"])(CloudFormationService, [{
    key: "getOutputs",
    value: function getOutputs() {
      var params = {
        StackName: this.stackName
      };
      return this.provider.request('CloudFormation', 'describeStacks', params).then(function (_ref) {
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