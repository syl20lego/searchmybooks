var express = require('express');
var router = express.Router();
var fs = require('fs');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: ['error', 'trace']
});

/* GET setting */
router.get('/', function (req, res, next) {
    client.cluster.stats({}, function (error, response) {
        if (error) {
            console.log(error);
            if (error.statusCode === 404) {
                res.status(204).send();
            } else {
                res.status(500).send(error);
            }
        } else if (response) {
            console.log(response);
            res.status(200).send(response);
        }
    });
});

router.get('/mapping', function (req, res, next) {
    client.indices.getMapping({
        index: 'bookindex'
    }, function (error, response) {
        if (error) {
            console.log(error);
            if (error.statusCode === 404) {
                res.status(204).send();
            } else {
                res.status(500).send(error);
            }
        } else if (response) {
            console.log(response);
            res.status(200).send(response);
        }
    });
});

router.get('/create', function (req, res, next) {

    var mapping = {
        book: {
            properties: {
                file: {
                    "type": "attachment",
                    "fields": {
                        "content": {
                            "store": true,
                            "term_vector": "with_positions_offsets"
                        },
                        "name": {
                            "store": true
                        },
                        "date": {
                            "type": "date",
                            "store": true
                        },
                        "author": {
                            "store": true
                        },
                        "keywords": {
                            "store": true
                        },
                        "content_length": {
                            "type": "integer",
                            "store": true
                        },
                        "content_type": {
                            "store": true
                        },
                        "title": {
                            "store": true
                        }
                    }
                }
            }
        }
    };

    client.indices.create({index: "bookindex"}, function (error, response) {
        if (error) {
            console.log(error);
            res.status(500).send(error);
        } else if (response) {
            console.log(response);
            client.indices.putMapping({index: "bookindex", type: "book", body: mapping}, function (error, response) {
                if (error) {
                    console.log(error);
                    res.status(500).send(error);
                } else if (response) {
                    console.log(response);
                    res.status(200).send(response);
                }
            });
        }
    });
});

router.get('/delete', function (req, res, next) {
    client.indices.delete({
        index: 'bookindex'
    }, function (error, response) {
        if (error) {
            console.log(error);
            res.status(500).send(error);
        } else if (response) {
            console.log(response);
            res.status(200).send(response);
        }
    });
    var dirPath = __dirname + '/../local/storage/books/';
    var structure = fs.readdirSync(dirPath);
    structure.forEach(function(file){
        var filePath = dirPath + file;
        fs.stat(filePath, function(error, stats){
            if (error) {
                console.log(JSON.stringify(error));
            } else if (stats.isFile()) {
                fs.unlinkSync(filePath);
            }
        });
    });
});

module.exports = router;
