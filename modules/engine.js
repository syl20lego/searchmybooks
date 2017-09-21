'use strict';
var elasticsearch = require('elasticsearch');
var fs = require('fs');
var settings = require('../settings')
var Promise = require("bluebird");

/*
 https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html

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
        create: function () {
            // return client.ingest.putPipeline( {id: 'attachment', body: attachmentMappingProperties});
            return client.indices.create({index: "bookindex"})
                .then(function () {
                    return client.indices.putMapping({index: "bookindex", type: "book", body: fileMappingProperties})
                        .then(function () {
                            return client.ingest.putPipeline({id: 'attachment', body: attachmentMappingProperties})
                                .then(function (response) {
                                    return response;
                                });
                        });
                });
        },
        delete: function(path){
            var structure = fs.readdirSync(path);
            structure.forEach(function (file) {
                var filePath = path + file;
                fs.stat(filePath, function (error, stats) {
                    if (error) {
                        console.log(JSON.stringify(error));
                    } else if (stats.isFile()) {
                        fs.unlinkSync(filePath);
                    }
                });
            });
            return client.indices.delete({index: 'bookindex'}).then(function (response) {
                return client.ingest.deletePipeline({id: 'attachment'}).then(function(){
                    return response;
                });
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
                        input: title.toLowerCase().split(/[&+% ,._-]+/).filter(Boolean)
                    },
                    data: content,
                    name: filename
                },
                pipeline: 'attachment'
            });
        }
    },
    books : {
        searchDefault: function(index, size){
            return client.search({
                index: 'bookindex',
                from: index,
                size: size,
                _source: fieldsFilters,
                sort: "attachment.date:desc"
            });
        },
        seacrhTerms: function(terms, index, size){
            return client.search({
                index: 'bookindex',
                from: index,
                size: size,
                _source: fieldsFilters,
                body: {
                    query: {
                        match: {
                            "attachment.content": terms
                        }
                    },
                    highlight: {
                        order : 'score',
                        pre_tags : ['<b>'],
                        post_tags : ['</b>'],
                        fields: {
                            "attachment.content": {"fragment_size" : 200, "number_of_fragments": 5}
                        }
                    }
                }
            });
        },
        suggestion: function(input){
            return client.search({
                index: 'bookindex',
                from: 0,
                size: 5,
                _source: fieldsFilters,
                body: {
                    suggest : {
                        suggestQuery: {
                            text: input,
                            "completion" :{
                                "field": "suggest"
                            }
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
    host: settings.ELASTICSEARCH_URL,
    log: ['error', 'trace']
});

var fieldsFilters =  [
    "score",
    "path",
    "name",
    "coverPage",
    "attachment.title",
    "attachment.author",
    "attachment.date",
    "attachment.keywords",
    "attachment.content_length",
    "attachment.language"
];

var fileMappingProperties = {
    book: {
        properties: {
            title: {type: "string"},
            path: {type: "string"},
            coverPage: {type: "string"},
            suggest: {
                // https://www.elastic.co/guide/en/elasticsearch/reference/master/search-suggesters-completion.html
                type: "completion"
                // analyzer: "simple",
                // search_analyzer: "analyzer",
                // max_input_length: 20
            }
        }
    }
};

var attachmentMappingProperties = {
    description : "Extract attachment information",
    processors : [
        {
            attachment : {
                field : "data",
                indexed_chars: -1,
                properties: [ "content", "title", "author", "date", "keywords", "content_length", "language"]
            }
        }
    ]
};
