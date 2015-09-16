angular.module('blocJams', ['config'])
    .controller('LandingCtrl', ['$scope', function($scope) {
        
        $scope.tagLine = "Turn the music up!";
        
    }])
    .controller('CollectionCtrl', ['$scope', function($scope) {
        
        $scope.albums = [albumPicasso, albumMarconi, albumBeastieBoys];
        
        $scope.setAlbum = function($index) {
            currentAlbum = $scope.albums[$index];
        };
        
    }])
    .controller('AlbumCtrl', ['$scope', function($scope) {
        $scope.album = currentAlbum;
        
    }]);

angular.module('config', ['ui.router'])
    .config(function($stateProvider, $locationProvider) {
    
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    
        $stateProvider
            .state('landing', {
                url: '/',
                controller: 'LandingCtrl',
                templateUrl: 'templates/landing.html'
            })
            .state('collection', {
                url: '/collection',
                controller: 'CollectionCtrl',
                templateUrl: 'templates/collection.html'
            })
            .state('album', {
                url: '/album',
                controller: 'AlbumCtrl',
                templateUrl: 'templates/album.html'
            });
    });
    
var currentAlbum = null;