"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var fs = require('fs');

var UploadFile = /*#__PURE__*/function () {
  function UploadFile(filename) {
    (0, _classCallCheck2["default"])(this, UploadFile);
    this.filename = filename;
  }

  (0, _createClass2["default"])(UploadFile, [{
    key: "getKey",
    value: function getKey() {}
  }, {
    key: "getPathName",
    value: function getPathName() {}
  }, {
    key: "getStream",
    value: function getStream() {
      return fs.createReadStream(this.filename);
    }
  }]);
  return UploadFile;
}();

module.exports = UploadFile;
//# sourceMappingURL=BucketFile.js.map