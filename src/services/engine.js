'use strict';
const fs = require('fs');

/*
 https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html

 Public section
*/
module.exports = (driver) => {
    // function to encode file data to base64 encoded string
    const base64_encode = (file) => {
        // read binary data
        const bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    };

    const fieldsFilters = [
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

    const fileMappingProperties = {
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
    return {
        admin: {
            stats: () => {
                return driver.client.cluster.stats({});
            },
            mappings: () => {
                return driver.client.indices.getMapping({
                    index: 'bookindex'
                });
            },
            create: () => {
                // return driver.client.ingest.putPipeline( {id: 'attachment', body: attachmentMappingProperties});
                return driver.client.indices.create({index: "bookindex"})
                    .then(() => {
                        return driver.client.indices.putMapping({
                            index: "bookindex",
                            type: "book",
                            body: fileMappingProperties
                        })
                            .then(() => {
                                return driver.client.ingest.putPipeline({id: 'attachment', body: attachmentMappingProperties})
                                    .then((response) => {
                                        return response;
                                    });
                            });
                    });
            },
            delete: (path) => {
                const structure = fs.readdirSync(path);
                structure.forEach((file) => {
                    const filePath = path + file;
                    fs.stat(filePath, (error, stats) => {
                        if (error) {
                            console.log(JSON.stringify(error));
                        } else if (stats.isFile()) {
                            fs.unlinkSync(filePath);
                        }
                    });
                });
                return driver.client.indices.delete({index: 'bookindex'}).then((response) => {
                    return driver.client.ingest.deletePipeline({id: 'attachment'}).then(() => {
                        return response;
                    });
                });
            }
        },
        index: {
            add: (id, title, path, filename, size, coverImage) => {
                const content = base64_encode(path);
                return driver.client.index({
                    index: 'bookindex',
                    id: id,
                    type: 'book',
                    body: {
                        title: title,
                        path: path,
                        coverPage: coverImage ? coverImage : {},
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
        books: {
            searchDefault: (index, size) => {
                return driver.client.search({
                    index: 'bookindex',
                    from: index,
                    size: size,
                    _source: fieldsFilters,
                    sort: "attachment.date:desc"
                });
            },
            seacrhTerms: (terms, index, size) => {
                return driver.client.search({
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
                            order: 'score',
                            pre_tags: ['<b>'],
                            post_tags: ['</b>'],
                            fields: {
                                "attachment.content": {"fragment_size": 200, "number_of_fragments": 5}
                            }
                        }
                    }
                });
            },
            suggestion: (input) => {
                return driver.client.search({
                    index: 'bookindex',
                    from: 0,
                    size: 5,
                    _source: fieldsFilters,
                    body: {
                        suggest: {
                            suggestQuery: {
                                text: input,
                                "completion": {
                                    "field": "suggest"
                                }
                            }
                        }
                    }
                });
            }
        }
    };



};

const attachmentMappingProperties = {
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
