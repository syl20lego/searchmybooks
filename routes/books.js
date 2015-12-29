var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: ['error', 'trace']
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
  res.send('respond with a resource');
});

router.post('/upload', upload.any(),function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.files);
    var current = req.files[0];
    var encoded = base64_encode(current.path);
    console.log(encoded.length);

    client.create({
        index: 'bookindex',
        id: current.originalname,
        type: 'book',
        body: {
            title: current.originalname,
            file :  {
                _content: encoded
            }
        }
    }, function (error, response) {
        console.log(error);
        console.log(response);
    });

    res.sendStatus(200);
});


module.exports = router;


// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}