"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var fs = require('fs');

var S3Key = /*#__PURE__*/function () {
  function S3Key(filename) {
    (0, _classCallCheck2["default"])(this, S3Key);
    this.filename = filename;
  }

  (0, _createClass2["default"])(S3Key, [{
    key: "getKey",
    value: function getKey() {
      var SLASH = '/';

      if (/^win/.test(process.platform)) {
        SLASH = '\\';
      }

      return this.filename.replace("".concat(process.cwd()).concat(SLASH), '');
    }
  }, {
    key: "getPath",
    value: function getPath() {
      return this.filename;
    }
  }, {
    key: "getStream",
    value: function getStream() {
      return fs.createReadStream(this.filename);
    }
  }]);
  return S3Key;
}();

module.exports = S3Key;
//# sourceMappingURL=S3Key.js.map