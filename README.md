# serverless-layers
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Issues](https://img.shields.io/github/issues/agutoli/serverless-layers.svg)](https://github.com/agutoli/serverless-layers/issues) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.npmjs.com/package/serverless-layers)
[![NPM](https://img.shields.io/npm/v/serverless-layers.svg)](https://www.npmjs.com/package/serverless-layers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

* Automatically attach layers for each lambda function
* Creates a new layer version when `package.json` was updated
* If package.json was not changed, it does not publish a new layer
* Reduces drastically lambda size
* It reduces deployment time.

## Install

`npm install -D serverless-layers`

Add the plugin to your `serverless.yml` file:

`ATENTION`

Param `deploymentBucket` is required!

## Serverless configuration
```yaml
provider:
  ...
  deploymentBucket: #required!
    name: "your_bucket"

package:
  individually: false
  exclude:
    - node_modules/**
  excludeDevDependencies: true

plugins:
  - serverless-layers
```

## Contributing

Yes, thank you!
This plugin is community-driven, most of its features are from different authors.
Please update the docs and tests and add your name to the package.json file.
We try to follow [Airbnb's JavaScript Style Guide](https://github.com/airbnb/javascript).

## License

MIT
