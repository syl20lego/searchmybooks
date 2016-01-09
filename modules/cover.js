'use strict';
var PDFImage = require("pdf-image").PDFImage;


// Public
module.exports = {
    create: function(file) {
        console.log('Creating cover page ' + file);
        var pdfImage = new PDFImage(file);
        pdfImage.setConvertOptions({"-geometry ": "x240"});
        return pdfImage.convertPage(0);
    }
};
