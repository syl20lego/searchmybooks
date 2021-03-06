# searchmybooks
Book library server

Store and search books library

# Elasticsearch

## Install Elasticsearch
[https://www.elastic.co/downloads/elasticsearch](https://www.elastic.co/downloads/elasticsearch)

## Install ingest-attachment pluggin for elasticsearch

```
elasticsearch-plugin install ingest-attachment
```

## Configuration
Books are converted in base64 and requires bigger http content
elasticsearch.yml

```
# Set a custom allowed content length:
# 
http.max_content_length: 200mb
```
# pdf-image
Convert PDF to cover image
https://github.com/mooz/node-pdf-image    
    
# Installation
npm install

npm start

# Service is available
[http://localhost:3000/](http://localhost:3000/)

## Create index
Go to the admin tab an create the elasticSearch index.

If you need to delete everything (this is not a production feature), you can select "delete all index", this will also remove the storage.

## Upload your pdf
Go to the upload tab and you can upload one or many pdf.
The pdf will be index in ES, stored in the server local/storage/books along a pdf image of the cover page.


# ElasticSearch

- [ES stats](http://localhost:9200/_stats)
- [ES index](http://localhost:9200/bookindex)
