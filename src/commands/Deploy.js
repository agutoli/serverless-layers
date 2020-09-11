const dependencies = {
  path: require('path')
};

module.exports = async ($sls, params, injections) => {
  const { path } = { ...dependencies, ...injections };
  console.log('deployyy');
}
