const {ZipLayer} = require('./dist/core/ZipLayer')

async function main() {
  const result = await ZipLayer.folder('./tests/fixtures/zip-layer-test', {
    output: '/tmp/lambda/test.zip'
  });

  console.log({ result });
}

main();

// const options = {
//   region: "us-east-1",
//   stage: "dev"
// };

// const getServerless = (options) => {
//   let provider = {
//     options: {},
//     runtime: options.runtime,
//     deploymentBucket: 'my-deployment-bucket',
//     naming: {
//       getStackName: () => 'my-mock-stack-name',
//       getLambdaLayerOutputLogicalId: () => 'hello',
//     },
//     getRegion: () => 'us-east-1'
//   };

//   let service = {
//     provider,
//     custom: options.custom,
//     functions: {},
//   };

//   return {
//     log: console.log,
//     cli: {
//       log: console.log
//     },
//     error: console.error,
//     service,
//     getVersion: () => '1.34.0',
//     getProvider: () => provider
//   };
// }

// const serverless = getServerless({
//   runtime: 'python3.8',
//   custom: {
//     "serverless-layers": {
//       dependenciesPath: './tests/fixtures/custom-requirements.txt'
//     }
//   }
// });

// const sls = new ServerlessLayers(serverless, options);
// console.log(sls);
