'use strict';

module.exports.foo = async event => {
  return {
    statusCode: 200,
    body: 'foo'
  };
};


module.exports.bar = async event => {
  return {
    statusCode: 200,
    body: 'bar'
  };
};
