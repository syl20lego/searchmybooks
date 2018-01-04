'use strict';
const assert = require('assert');
const express = require('express');

const elasticsearch = require('elasticsearch');

const Engine = require("./services/engine");

const routes = require('./routes/index');
const settings = require('../settings');

class Main {

    constructor({app, config}) {
        assert(app && config, `expected express application ${app} and environment configurations ${config}`);
        this.config = config;

        app.use(express.static(settings.PUBLIC_DIR));
        app.use("/download", express.static(settings.BOOKS_DIR));
        app.use("/dist", express.static(settings.MODULES_DIR));

        this.driver = {};
        const engine = Engine(this.driver);
        const books = require('./routes/books')(engine);
        const admin = require('./routes/admin')(engine);

        app.use('/', routes);
        app.use('/books', books);
        app.use('/admin', admin);
    }

    start() {
        this.driver.client = new elasticsearch.Client({
            host: this.config.elasticsearch.host,
            log: this.config.elasticsearch.log
        });
        console.log(`App running`);
    }

    stop() {
        console.log(`App terminating`);
        if (this.driver.client) {
            this.driver.client.close();
        }
    }
}

module.exports = Main;
