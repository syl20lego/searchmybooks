'use strict';
var elasticsearch = require('elasticsearch');
var fs = require('fs');

/*
 Public section
*/
module.exports = {
    admin :{
        stats: function(){
            return client.cluster.stats({});
        },
        mappings: function(){
            return client.indices.getMapping({
                index: 'bookindex'
            });
        },
        create: function(){

            return client.indices.create({index: "bookindex"}).then(function(){
                return client.indices.putMapping({index: "bookindex", type: "book", body: fileMappingProperties})
            });
        },
        delete: function(path){
            return client.indices.delete({index: 'bookindex'}).then(function(response){
                var structure = fs.readdirSync(path);
                structure.forEach(function(file){
                    var filePath = path + file;
                    fs.stat(filePath, function(error, stats){
                        if (error) {
                            console.log(JSON.stringify(error));
                        } else if (stats.isFile()) {
                            fs.unlinkSync(filePath);
                        }
                    });
                });
                return response;
            });
        }
    },
    index : {
        add : function(id, title, path, filename, size, coverImage){
            var content = base64_encode(path);
            return client.index({
                index: 'bookindex',
                id: id,
                type: 'book',
                body: {
                    title: title,
                    path: path,
                    coverPage : coverImage?coverImage:{},
                    suggest: {
                        input: title.split(" "),
                        output: title,
                        payload: filename?filename:{}
                    },
                    file :  {
                        _name: filename,
                        _content_length: size,
                        _content: content
                    }
                }
            });
        }
    },
    books : {
        searchDefault: function(index, size){
            return client.search({
                index: 'bookindex',
                from: index,
                size: size,
                sort: "file.date:desc",
                body: {
                    fields: fieldsFilters
                }
            });
        },
        seacrhTerms: function(terms, index, size){
            return client.search({
                index: 'bookindex',
                from: index,
                size: size,
                body: {
                    fields: fieldsFilters,
                    query: {
                        match: {
                            "file.content": terms
                        }
                    },
                    highlight: {
                        order : 'score',
                        pre_tags : ['<b>'],
                        post_tags : ['</b>'],
                        fields: {
                            "file.content": {"fragment_size" : 500, "number_of_fragments": 2}
                        }
                    }
                }
            });
        },
        suggestion: function(input){
            return client.suggest({
                    index: 'bookindex',
                    body: {
                        suggest: {
                            text: input,
                            completion: {
                                field: "suggest",
                                fuzzy: true
                            }
                        }
                    }
                });
        }
    }
};

/*
 Private Section
 */

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

var client = new elasticsearch.Client({
    host: 'localhost:9200'
    //log: ['error', 'trace']
});

var fieldsFilters =  [
    "score",
    "title",
    "path",
    "coverPage",
    "file.author",
    "file.name",
    "file.content_type",
    "file.content_length",
    "file.date",
    "file.keywords"
];

var fileMappingProperties = {
    book: {
        properties: {
            title: { type: "string" },
            path: { type: "string" },
            coverPage: { type: "string" },
            suggest: {
                type: "completion",
                analyzer: "simple",
                search_analyzer: "simple",
                payloads: true
            },
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
