# serverless-ini-env
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Issues](https://img.shields.io/github/issues/agutoli/serverless-ini-env.svg)](https://github.com/agutoli/serverless-ini-env/issues) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.npmjs.com/package/serverless-ini-env)
[![NPM](https://img.shields.io/npm/v/serverless-ini-env.svg)](https://www.npmjs.com/package/serverless-ini-env)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

## Install

`npm install -D serverless-ini-env`

Add the plugin to your `serverless.yml` file:

```yaml
plugins:
  - serverless-ini-env
```

## Serverless configuration
```yaml
custom:
  serverless-ini-env:
    dev: "./your_configs/dev.ini"
    prod: "./your_configs/prod.ini"

functions:
  my_function_name_a:
    handler: handler.a_func
  my_function_name_b:
    handler: handler.b_func
```

`Note:` If you did not specify any configuration, plugins will consider root folder and stage options ex.

`sls deploy --stage qa` -> `./qa.ini`

`sls deploy --stage dev` -> `./dev.ini`

## Environment configuration example

`./your_configs/dev.ini`

```ini
# will be available for both functions
MY_GLOBAL_VAR=DEV_VALUE

[my_function_name_a]
  NAME="function A"
  FOO=DEV_VALUE

[my_function_name_b]
  NAME="function B"
  BAR=DEV_VALUE
```

`./your_configs/prod.ini`

```ini
# will be available for both functions
MY_GLOBAL_VAR=PROD_VALUE

[my_function_name_a]
  NAME="function A"
  FOO=PROD_VALUE

[my_function_name_b]
  NAME="function B"
  BAR=PROD_VALUE
```

# Usage and command line options
```shell
# Update all lambda environments
sls update-environments --stage prod

# Update a single function environments vars
sls update-environments function -f my_function_name_a --stage qa
```

## Contributing

Yes, thank you!
This plugin is community-driven, most of its features are from different authors.
Please update the docs and tests and add your name to the package.json file.
We try to follow [Airbnb's JavaScript Style Guide](https://github.com/airbnb/javascript).

## License

MIT
