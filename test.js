const chalk = require('chalk');


let test = 'arn:aws:lambda:us-east-1:336870424643:layer:sls-example-dev-nodejs-common:3'
let pattern = /arn:aws:lambda:([^:]+):([0-9]+):layer:([^:]+):([0-9]+)/g;

console.log(test.replace(pattern, chalk.white(`arn:aws:lambda:${chalk.bold.magenta('$1')}:*********:${chalk.bold.magenta('$3')}:$4`)))