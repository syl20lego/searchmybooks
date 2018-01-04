'use strict';

const config = require('./config.json');

module.exports = (environment) => {
    return {
        environment: environment,
        ...config[environment]
    }
};
