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
  res.send('respond with a resource');
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
        }
        if (response){
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