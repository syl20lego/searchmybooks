'use strict';
var express = require('express');
var router = express.Router();
var engine = require("../modules/engine");
var settings = require('../settings');

/* GET setting */
router.get('/', function (req, res, next) {
    engine.admin.stats().then(function(response){
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

router.get('/mapping', function (req, res, next) {
    engine.admin.mappings().then(function(response){
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

router.get('/create', function (req, res, next) {
    engine.admin.create().then(function(response){
        console.log(response);
        res.status(200).send(response);
    }).catch(function(error){
        console.log(error);
        res.status(500).send(error);
    });
});

router.get('/delete', function (req, res, next) {
    engine.admin.delete(settings.BOOKS_DIR).then(function(response){
        console.log(response);
        res.status(200).send(response);
    }).catch(function(error){
        console.log(error);
        res.status(500).send(error);

    });
});

module.exports = router;
