const fs = require('fs');

class S3Key {
  constructor(filename) {
    this.filename = filename;
  }

  getKey() {
    let SLASH = '/';
    if (/^win/.test(process.platform)) {
      SLASH = '\\';
    }
    return this.filename.replace(`${process.cwd()}${SLASH}`, '');
  }

  getPath() {
    return this.filename;
  }

  getStream() {
    return fs.createReadStream(this.filename);
  }
}

module.exports = S3Key;
