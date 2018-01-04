'use strict';
const express = require('express');
const multer = require('multer');
const settings = require('../../settings');
const cover = require("../services/cover");
const router = express.Router();

const storage = multer.diskStorage({
    destination: settings.BOOKS_DIR,
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });


module.exports = (engine) => {

    /* GET users listing. */
    router.get('/', (req, res) => {
        engine.books.searchDefault(0, 10).then((response) => {
            console.log(response);
            res.status(200).send(response);
        });
    });

    /* GET users listing. */
    router.get('/search', (req, res) => {
        const terms = decodeURIComponent(req.query.terms);
        engine.books.seacrhTerms(terms, req.query.index > 0 ? req.query.index: 0, 50).then((response) => {
            console.log(response);
            res.status(200).send(response);
        });
    });

    router.get('/suggest', (req, res) => {
        const input = decodeURIComponent(req.query.q);
        engine.books.suggestion(input).then((response) => {
            console.log(response);
            res.status(200).send(response);
        });
    });

    router.post('/upload', upload.any(),(req, res) => {
        // req.file is the `avatar` file
        // req.body will hold the text fields, if there were any
        console.log(req.files);
        const current = req.files[0];

        cover.create(current.path).then((imagePath) => {
            const imageName = imagePath.replace(settings.BOOKS_DIR, '');
            console.log('Cover image created ' + imageName);
            engine.index.add(current.originalname, current.originalname, current.path, current.filename, current.size, imageName).then((response) => {
                console.log(response);
                res.status(200).send(response);

            });
        }).catch((error) => {
            console.log('Oups Cover image problem ' +  JSON.stringify(error));
            engine.index.add(current.originalname, current.originalname, current.path, current.filename, current.size).then((response) => {
                console.log(response);
                res.status(200).send(response);

            });
        });
    });
    return router;
};
