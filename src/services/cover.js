'use strict';
const PDFImage = require("pdf-image").PDFImage;


// Public
module.exports = {
    create: (file) => {
        console.log('Creating cover page ' + file);
        const pdfImage = new PDFImage(file);
        pdfImage.setConvertOptions({"-geometry ": "x240"});
        return pdfImage.convertPage(0);
    }
};
