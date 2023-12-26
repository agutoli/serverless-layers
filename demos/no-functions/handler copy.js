const myLibName = require('my-lib-name');

module.exports.hello = async event => {

  myLibName.doSomething();

  return {
    statusCode: 200,
    body: 'foo'
  };
};
