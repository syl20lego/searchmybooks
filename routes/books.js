var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200'
    //log: ['error', 'trace']
});

var storage = multer.diskStorage({
    destination: __dirname + '/../local/storage/books/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

var upload = multer({ storage: storage })

/* GET users listing. */
router.get('/', function(req, res, next) {
    client.search({
        index: 'bookindex',
        from: 0,
        size: 10,
        sort: "file.date:desc",
        body: {
            "fields": [
            "title",
            "path",
            "file.author",
            "file.name",
            "file.content_type",
            "file.content_length",
            "file.date",
            "file.keywords"
            ]
        }
    }, function (error, response) {
        if (error){
            console.log(error);
            res.status(500).send(error);
        }else if (response){
            console.log(response);
            res.status(200).send(response);
        }
    });

});

/* GET users listing. */
router.get('/search', function(req, res, next) {
    var terms = decodeURIComponent(req.query.terms);
    client.search({
        index: 'bookindex',
        from: req.query.index > 0 ? req.query.index: 0,
        size: 50,
        body: {
            "fields": [
                "title",
                "score",
                "path",
                "file.author",
                "file.name",
                "file.content_type",
                "file.content_length",
                "file.date",
                "file.keywords"
            ],
            "query": {
                "match": {
                    "file.content": terms
                }
            },
            "highlight": {
                "fields": {
                    "file.content": {}
                }
            }
        }
    }, function (error, response) {
        if (error){
            console.log(error);
            res.status(500).send(error);
        }else if (response){
            console.log(response);
            res.status(200).send(response);
        }
    });

});


router.post('/upload', upload.any(),function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.files);
    var current = req.files[0];
    var encoded = base64_encode(current.path);
    console.log(encoded.length);

    client.index({
        index: 'bookindex',
        id: current.originalname,
        type: 'book',
        body: {
            title: current.originalname,
            path: current.path,
            file :  {
                _name: current.filename,
                _content_length: current.size,
                _content: encoded
            }
        }
    }, function (error, response) {
        if (error){
            console.log(error);
            res.status(500).send(error);
        }else if (response){
            console.log(response);
            res.status(200).send(response);
        }
    });
});


module.exports = router;


// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}