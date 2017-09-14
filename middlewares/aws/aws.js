/**
 * Amazon Web Services
 */
class Aws {
    constructor() {
        const path = require('path');
        const appDir = `${path.dirname(require.main.filename)}/..`;

        this.api = require("aws-sdk");
        this.api.config.loadFromPath(`${appDir}/.aws/credentials.json`);
    }
}

module.exports.Aws = Aws;
