const path = require('path');

const settings = {
    PROJECT_DIR : __dirname,
    BOOKS_DIR :  path.join(__dirname, '/local/storage/books/'),
    MODULES_DIR :  path.join(__dirname, '/node_modules/'),
    PUBLIC_DIR :  path.join(__dirname, '/public'),
    DEFAULT_PORT: 3000
};

module.exports = settings;