# Serverless Layers

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Issues](https://img.shields.io/github/issues/agutoli/serverless-layers.svg)](https://github.com/agutoli/serverless-layers/issues) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.npmjs.com/package/serverless-layers)
[![NPM](https://img.shields.io/npm/v/serverless-layers.svg)](https://www.npmjs.com/package/serverless-layers)
[![Build Status](https://travis-ci.org/agutoli/serverless-layers.svg?branch=master)](https://travis-ci.org/agutoli/serverless-layers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)
![Node.js CI](https://github.com/agutoli/serverless-layers/workflows/Node.js%20CI/badge.svg)

* Automatically attaches layers to the provider and for each function
  * Skips functions with no other layers as they will use the layer(s) we added to the provider
* Creates a new layer's version when `dependencies` are updated
* Does not publish a new layer if `dependencies` are unchanged
* Drastically reduces lambda size
* Reduces deployment time
* Allows sharing of the same layers (libraries) among all lambda functions

## Options

* [NodeJS](#nodejs)
* [Ruby](#ruby)
* [Python](#python)

## Common Requirements

* AWS only (sorry)
* Serverless >= 1.34.0 (layers support)

## Install

```bash
npm install -D serverless-layers
```

or

```bash
serverless plugin install --name serverless-layers
```

Add the plugin to your `serverless.yml` file:

## Single layer config

Example:

```yaml
plugins:
  - serverless-layers
  
custom:
  serverless-layers:
    functions: # optional
      - my_func2
    dependenciesPath: ./package.json

functions:
  my_func1:
    handler: handler.hello
  my_func2:
    handler: handler.hello
```

## Multiple layers config

Example:

```yaml
plugins:
  - serverless-layers
  
custom:
  serverless-layers:
    # applies for all lambdas 
    - common:
        dependenciesPath: ./my-folder/package.json
    # apply for foo only
    - foo:
        functions:
          - foo
        dependenciesPath: my-folder/package-foo.json
    - staticArn:
        functions:
          - foo
          - bar
        arn: arn:aws:lambda:us-east-1:<your_account>:layer:node-v13-11-0:5

functions:
  foo:
    handler: handler.hello
  bar:
    handler: handler.hello
```

![Screen Shot 2020-04-05 at 2 04 38 pm](https://user-images.githubusercontent.com/298845/78466747-2fb58f80-7748-11ea-948d-4fce40a753bb.png)

| Option                       | Type     | Default         | Description                              |
|------------------------------|----------|-----------------|------------------------------------------|
| compileDir                   | `string` | .serverless     | Compilation directory                    |
| layersDeploymentBucket       | `string` |                 | Specify a bucket to upload lambda layers. `Required if deploymentBucket is not defined.` |
| customInstallationCommand    | `string` |                 | Specify a custom command to install dependencies, e.g., `MY_ENV=1 npm --proxy http://myproxy.com i -P` |
| customHash                   | `string` |                 | Specify a custom string that, once changed, will force a new build of the layer |
| retainVersions               | `int`    | `null`          | Number of layer versions to keep; older versions will be removed after deployments |

## NodeJS

### Requirements

* Node >= v6.10.3
* NPM >= 3.10.10
* A valid `package.json` file

### Options

| Option                      | Type     | Default         | Description                                                  |
|-----------------------------|----------|-----------------|--------------------------------------------------------------|
| packageManager              | `string` | npm             | Possible values: npm, yarn                                   |
| packagePath                 | `string` | package.json    | `(DEPRECATED)`: Available for `<= 1.5.0`; for versions `>= 2.x`, use `compatibleRuntimes` |
| dependenciesPath            | `string` | package.json    | Note: `>= 2.x` versions. You can specify a custom path for your `package.json` |
| compatibleRuntimes          | `array`  | `['nodejs']`    | Possible values: nodejs, nodejs10.x, nodejs12.x              |
| layerOptimization.cleanupPatterns | `array` | [check](https://github.com/agutoli/serverless-layers/blob/master/src/runtimes/nodejs.js) | Pattern of files to cleanup in the layer artifact before uploading it |

## Ruby

### Requirements

* Ruby >= 2.5
* A valid `Gemfile` file

### Options

| Option                      | Type     | Default         | Description                                                  |
|-----------------------------|----------|-----------------|--------------------------------------------------------------|
| packageManager              | `string` | bundle          | Possible values: bundle                                      |
| dependenciesPath            | `string` | Gemfile         | Note: Available for `>= 2.x` versions. You can specify a custom path for your `Gemfile` |
| compatibleRuntimes          | `array`  | `['ruby']`      | Possible values: ruby2.5, ruby2.7                           |
| layerOptimization.cleanupPatterns | `array` | [check](https://github.com/agutoli/serverless-layers/blob/master/src/runtimes/ruby.js) | Pattern of files to cleanup in the layer artifact before uploading it |

## Python

### Requirements

* Python >= 2.7
* A valid `requirements.txt` file

### Options

| Option                      | Type     | Default         | Description                                                  |
|-----------------------------|----------|-----------------|--------------------------------------------------------------|
| packageManager              | `string` | pip             | Possible values: pip                                         |
| dependenciesPath            | `string` | requirements.txt | Note: Available for `>= 2.x` versions. You can specify a custom path for your `requirements.txt` |
| compatibleRuntimes          | `array`  | `['python']`    | Possible values: python2.7, python3.x                       |
| layerOptimization.cleanupPatterns | `array` | [check](https://github.com/agutoli/serverless-layers/blob/master/src/runtimes/python.js) | Pattern of files to cleanup in the layer artifact before uploading it |

## Default Serverless Setup

This plugin will set up the following options automatically if not specified in `serverless.yml`.

| Option                      | Type     | Default         |
|-----------------------------|----------|-----------------|
| package.individually           | `bool` | false                 |
| package.patterns               | `array`| `['node_modules/**']` |
| package.excludeDevDependencies | `bool` | false                 |


## Minimal Policy permissions for CI/CD IAM users

`serverless-layers-policy.json`

```json
{
   "Version":"2012-10-17",
   "Statement":[
      {
         "Effect":"Allow",
         "Action":[
            "s3:PutObject",
            "s3:GetObject"
         ],
         "Resource": "arn:aws:s3:::examplebucket"
      },
      {
         "Effect":"Allow",
         "Action":[
            "cloudformation:DescribeStacks"
         ],
         "Resource": "*"
      },
      {
         "Effect":"Allow",
         "Action":[
            "lambda:PublishLayerVersion"
         ],
         "Resource": "*"
      }
   ]
}
```

## License

MIT

## Contributors

Yes, thank you! This plugin is community-driven, and most of its features are from different authors. Please update the docs and tests and add your name to the `package.json` file. We try to follow [Airbnb's JavaScript Style Guide](https://github.com/airbnb/javascript).

<!-- Copy-paste in your Readme.md file -->

<a href="https://github.com/agutoli/serverless-layers/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=agutoli/serverless-layers" />
</a>

Made with [contributors-img](https://contrib.rocks).
