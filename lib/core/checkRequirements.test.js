"use strict";

var _require = require('chai'),
    expect = _require.expect;

var sinon = require('sinon');

var CheckRequirements = require('./CheckRequirements');

describe('CheckRequirements', function () {
  it('call ', function () {
    return CheckRequirements(serverless.getVersion());
  });
});
//# sourceMappingURL=checkRequirements.test.js.map