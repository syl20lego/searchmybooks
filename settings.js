var path = require('path');

var settings = {
    PROJECT_DIR : __dirname,
    BOOKS_DIR :  path.join(__dirname, 'local/storage/books/')
};

module.exports = settings;