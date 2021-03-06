(function(){
    var app = angular.module('books',  ['ngRoute', 'angularFileUpload', 'infinite-scroll', 'ui.bootstrap']);

    // Application configuration:

    app.config(function( $locationProvider){

    });

    // Define routes
    app.config(function($routeProvider){
        $routeProvider
            // route for the home page
            .when('/', {
                templateUrl : 'pages/default.html',
                controller  : 'defaultController'
            })
            .when('/search', {
                templateUrl : 'pages/search.html',
                controller  : 'searchController'
            })
            .when('/upload', {
                templateUrl : 'pages/upload.html',
                controller  : 'uploadController'
            })
            .when('/admin', {
                templateUrl : 'pages/admin.html',
                controller  : 'adminController'
            });
    });

    // Application  Directives:

    // Set active class to currently selected menu item by comparing path
    app.directive('isActiveNav', [ '$location', function($location) {
        return {
            restrict: 'A',
            link: function(scope, element) {
                scope.location = $location;
                scope.$watch('location.path()', function(currentPath) {
                    if('/#' + currentPath === element[0].attributes['href'].nodeValue) {
                        element.parent().addClass('active');
                    } else {
                        element.parent().removeClass('active');
                    }
                });
            }
        };
    }]);

    app.filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);

    app.controller('searchController', function($scope, $http, SearchBook) {
        $scope.searchBook = new SearchBook();

        $scope.search = function() {
            console.log('new search: ' + $scope.terms);
            $scope.searchBook.terms = $scope.terms;
            $scope.searchBook.items = [];
            $scope.searchBook.busy = false;
            $scope.searchBook.nextPage();
            $scope.$emit('list:newSearch')
        };

        $scope.suggest = function(input) {
            return $http.get('/books/suggest?q=' + input).then(function(response){
                console.log('suggest: ' + JSON.stringify(response.data.suggest.suggestQuery[0]));
                return response.data.suggest.suggestQuery[0].options;
            });
        };

    });

    // SearchBook constructor function to encapsulate HTTP and pagination logic
    app.factory('SearchBook', function($http) {
        var constructor = function() {
            this.items = [];
            this.busy = false;
            this.terms = null;
        };

        constructor.prototype.nextPage = function() {
            if (!this.terms) return;
            if (this.busy) return;
            this.busy = true;

            console.log('Paging');
            var url = "/books/search?index=" + this.items.length + "&terms=" + encodeURIComponent(this.terms);
            $http.get(url).success(function(data) {
                if (this.items.length < data.hits.total ) {
                    var items = data.hits.hits;
                    for (var i = 0; i < items.length; i++) {
                        console.log(JSON.stringify(items[i]));
                        this.items.push(items[i]);
                    }
                    this.busy = false;
                }
            }.bind(this));
        };

        return constructor;
    });

    app.controller('defaultController', function($scope, $http) {

        $http.get('/books/').then(function(response){
            $scope.items = response.data.hits.hits;
            console.log('reloaded : ' + JSON.stringify(response.data.hits.hits));
        });
    });

    app.controller('uploadController', ['$scope', 'FileUploader', function($scope, FileUploader) {
        var uploader = $scope.uploader = new FileUploader({
            url: '/books/upload'
        });

        // FILTERS

        uploader.filters.push({
            name: 'maxQueue',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 1000;
            }
        });
        uploader.filters.push({
            name: 'extensionName',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                return item.type === 'application/pdf';
            }
        });

        uploader.filters.push({
            name: 'disabledElement',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                if (options === undefined)
                    return true;
                return !options.disabled;
            }
        });
        // CALLBACKS

        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function(fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function(item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
        };

        console.info('uploader', uploader);
    }]);

    app.controller('adminController', function($scope, $window, $http){

        var refresh = function(){
            //when landing on the page, get information
            $http.get('/admin/').then(function(response){
                console.log('data: ' + JSON.stringify(response.data));
                $scope.cluster = response.data;
            });
        };

        refresh();

        $scope.deleteAll = function() {
            var answer = $window.confirm('Are you sure this will destroy everything!');
            if (answer){
                $http.get('/admin/delete').then(function(response){
                    console.log('Deleted : ' + JSON.stringify(response));
                    $scope.cluster = {};
                });
            }
        };

        $scope.createIndexMapping = function() {
            $http.get('/admin/create').then(function(response){
                console.log('Created : ' + JSON.stringify(response));
                refresh();
            });
        };
    });
})();