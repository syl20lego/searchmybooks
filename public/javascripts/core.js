(function(){
    var app = angular.module('books',  ['ngRoute', 'angularFileUpload', 'infinite-scroll']);

    // Application configuration:

    app.config(function( $locationProvider){

    });

    // Define routes
    app.config(function($routeProvider){
        $routeProvider
            // route for the home page
            .when('/', {
                templateUrl : 'pages/default.html',
                controller  : 'searchController'
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

    app.controller('searchController', function($scope, $http) {
        $scope.formData = {};

        $scope.pagingFunction = function() {
            console.log('Paging');
            $http.get('/books/')
                .success(function (data) {
                    $scope.data = data;
                    console.log('reloaded : ' + $scope.data);
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
        };
    });

    app.controller('uploadController', ['$scope', 'FileUploader', function($scope, FileUploader) {
        var uploader = $scope.uploader = new FileUploader({
            url: '/books/upload'
        });

        // FILTERS

        uploader.filters.push({
            name: 'maxQueue',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 2;
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

    app.controller('adminController', function(){

    });
})();