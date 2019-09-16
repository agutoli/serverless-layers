# serverless-layers
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Issues](https://img.shields.io/github/issues/agutoli/serverless-layers.svg)](https://github.com/agutoli/serverless-layers/issues) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.npmjs.com/package/serverless-layers)
[![NPM](https://img.shields.io/npm/v/serverless-layers.svg)](https://www.npmjs.com/package/serverless-layers)
[![Build Status](https://travis-ci.org/agutoli/serverless-layers.svg?branch=master)](https://travis-ci.org/agutoli/serverless-layers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

* Automatically attach layers for each lambda function
* Creates a new layer version when `package.json` was updated
* If package.json was not changed, it does not publish a new layer
* Reduces drastically lambda size
* It reduces deployment time.
* Share same layers (libraries) with all lambda functions

## Requirements

* Serverless >= 1.34.0 (layers support)
* Node >= v6.10.3
* NPM >= 3.10.10
* AWS only (sorry)
* A valid package.json file

## Install

`npm install -D serverless-layers`

or

`serverless plugin install --name serverless-layers`

Add the plugin to your `serverless.yml` file:

## Simple usage
```yaml
provider:
  ...
  deploymentBucket:
    name: 'your_bucket'

plugins:
  - serverless-layers
```

## Plugin Options
Example:

```yaml
custom:
  serverless-layers:
    packageManager: npm
```

|     Option     |    Type   |   Default   | Description |
| -------------- | --------- | ----------- | ----------- |
| packageManager |  `string` |    npm      | Possible values: npm, yarn |
| compileDir     |  `string` | .serverless | Compilation directory |
| packagePath    |  `string` | package.json | You can specify custom path for your package.json |
| compatibleRuntimes |  `array` | `['nodejs']` | Possible values: nodejs, nodejs8.10, nodejs10.x |
| layersDeploymentBucket | `string` |  | You can specify a bucket to upload lambda layers. `Required if deploymentBucket is not defined.` |
| customInstallationCommand | `string` |  | It specify a custom command to install deps ex. `MY_ENV=1 npm --proxy http://myproxy.com i -P` |

## Default Serverless Setup

This plugin will setup follow options automatically if not specified at `serverless.yml`.

|     Option     |    Type   |   Default   |
| -------------- | --------- | ----------- |
| package.individually | `bool` | false    |
| package.exclude | `array` | `['node_modules/**']` |
| package.excludeDevDependencies | `bool` | false |

## Mininal Policy permissions for CI/CD IAM users

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


## Contributing

Yes, thank you!
This plugin is community-driven, most of its features are from different authors.
Please update the docs and tests and add your name to the package.json file.
We try to follow [Airbnb's JavaScript Style Guide](https://github.com/airbnb/javascript).

## License

MIT
