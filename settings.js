var path = require('path');

var settings = {
    PROJECT_DIR : __dirname,
    BOOKS_DIR :  path.join(__dirname, 'local/storage/books/'),
    MODULES_DIR :  path.join(__dirname, 'node_modules/'),
    ELASTICSEARCH_URL: 'localhost:9200'
};

module.exports = settings;