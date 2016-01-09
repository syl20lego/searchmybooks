'use strict';
var express = require('express');
var multer = require('multer');
var settings = require('../settings');
var engine = require("../modules/engine");
var cover = require("../modules/cover");
var router = express.Router();

var storage = multer.diskStorage({
    destination: settings.BOOKS_DIR,
    filename: function (req, file, cb) {
        //cb(null, Date.now() + '-' + file.originalname)
        cb(null, file.originalname)
    }
});

var upload = multer({ storage: storage });

/* GET users listing. */
router.get('/', function(req, res, next) {
    engine.books.searchDefault(0, 10).then(function(response){
        console.log(response);
        res.status(200).send(response);
    }).catch(function(error){
        console.log(error);
        res.status(500).send(error);
    });
});

/* GET users listing. */
router.get('/search', function(req, res, next) {
    var terms = decodeURIComponent(req.query.terms);
    engine.books.seacrhTerms(terms, req.query.index > 0 ? req.query.index: 0, 50).then(function(response){
        console.log(response);
        res.status(200).send(response);
    }).catch(function(error){
        console.log(error);
        res.status(500).send(error);

    });
});

router.get('/complete', function(req, res, next) {
    var input = decodeURIComponent(req.query.q);
    engine.books.suggestion(input).then(function(response){
        console.log(response);
        res.status(200).send(response);
    }).catch(function(error){
        console.log(error);
        res.status(500).send(error);

    });
});

router.post('/upload', upload.any(),function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.files);
    var current = req.files[0];

    cover.create(current.path).then(function (imagePath) {
        var imageName = imagePath.replace(settings.BOOKS_DIR, '');
        console.log('Cover image created ' + imageName);
        engine.index.add(current.originalname, current.originalname, current.path, current.filename, current.size, imageName).then(function(response){
            console.log(response);
            res.status(200).send(response);

        }).catch(function(error){
            console.log(error);
            res.status(500).send(error);

        });
    }).catch(function(error){
        console.log('Oups Cover image problem ' +  JSON.stringify(error));
        engine.index.add(current.originalname, current.originalname, current.path, current.filename, current.size).then(function(response){
            console.log(response);
            res.status(200).send(response);

        }).catch(function(error){
            console.log(error);
            res.status(500).send(error);

        });
    });
});

module.exports = router;
