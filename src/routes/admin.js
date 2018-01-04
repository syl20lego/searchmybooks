'use strict';
const express = require('express');
const router = express.Router();
const settings = require('../../settings');

module.exports = (engine) => {
    /* GET setting */
    router.get('/', (req, res)  => {
        engine.admin.stats().then((response) => {
            console.log(response);
            res.status(200).send(response);
        }).catch(function(error){
            console.log(error);
            if (error.statusCode === 404) {
                res.status(204).send();
            } else {
                res.status(500).send(error);
            }
        });
    });

    router.get('/mapping', (req, res)  => {
        engine.admin.mappings().then((response) => {
            console.log(response);
            res.status(200).send(response);
        }).catch((error) => {
            console.log(error);
            if (error.statusCode === 404) {
                res.status(204).send();
            } else {
                res.status(500).send(error);
            }
        });
    });

    router.get('/create', (req, res)  => {
        engine.admin.create().then((responses) => {
            console.log(responses);
            res.status(200).send(responses);
        });
    });

    router.get('/delete', (req, res)  => {
        engine.admin.delete(settings.BOOKS_DIR).then((response) => {
            console.log(response);
            res.status(200).send(response);
        });
    });
    return router;
};
