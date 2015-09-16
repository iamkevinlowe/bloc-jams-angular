angular.module('blocJams', ['ui.router'])
    .config(function($stateProvider, $locationProvider) {
    
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    
        $stateProvider
            .state('landing', {
                url: '/landing',
                controller: 'LandingCtrl',
                templateUrl: '/templates/landing.html'
            })
            .state('collection', {
                url: '/collection',
                controller: 'CollectionCtrl',
                templateUrl: '/templates/collection.html'
            })
            .state('album', {
                url: '/album',
                controller: 'AlbumCtrl',
                templateUrl: '/templates/album.html'
            });
    })
    .controller('LandingCtrl', ['$scope', function($scope) {
        $scope.tagLine = "Turn the music up!";
    }])
    .controller('CollectionCtrl', ['$scope', function($scope) {
        $scope.albums = [
            {
                name: 'The Colors',
                artist: 'Pablo Picasso',
                label: 'Cubism',
                year: '1881',
                albumArtUrl: 'assets/images/album_covers/01.png',
                songs: [
                    { name: 'Blue', length: '4:26', audioUrl: '/assets/music/blue' },
                    { name: 'Green', length: '3:14', audioUrl: '/assets/music/green' },
                    { name: 'Red', length: '5:01', audioUrl: '/assets/music/red' },
                    { name: 'Pink', length: '3:21', audioUrl: '/assets/music/pink' },
                    { name: 'Magenta', length: '2:15', audioUrl: '/assets/music/magenta' }
                ]
            },
            {
                name: 'The Telephone',
                artist: 'Guglielmo Marconi',
                label: 'EM',
                year: '1909',
                albumArtUrl: 'assets/images/album_covers/20.png',
                songs: [
                    { name: 'Hello, Operator?', length: '1:01' },
                    { name: 'Ring, ring, ring', length: '5:01' },
                    { name: 'Fits in your pocket', length: '3:21' },
                    { name: 'Can you hear me now?', length: '3:14' },
                    { name: 'Wrong phone number', length: '2:15'}
                ]
            },
            {
                name: 'Licensed to Ill',
                artist: 'Beastie Boys',
                label: 'Def Jam',
                year: '1986',
                albumArtUrl: 'assets/images/album_covers/beastie_boys-licensed_to_ill.jpg',
                songs: [
                    { name: 'Rhymin & Stealin', length: '4:08' },
                    { name: 'The New Style', length: '4:36' },
                    { name: 'She\'s Crafty', length: '3:35' },
                    { name: 'Posse in Effect', length: '2:27' },
                    { name: 'Slow Ride', length: '2:56' },
                    { name: 'Girls', length: '2:14' },
                    { name: 'Fight for Your Right', length: '3:28' },
                    { name: 'No Sleep till Brooklyn', length: '4:07' },
                    { name: 'Paul Revere', length: '3:41' },
                    { name: 'Hold It Now, Hit It', length: '3:26' },
                    { name: 'Brass Monkey', length: '2:37' },
                    { name: 'Slow and Low', length: '3:38' },
                    { name: 'Time to Get Ill', length: '3:37' }
                ]
            }
        ];
        
        $scope.setAlbum = function($index) {
            currentAlbum = $scope.albums[$index];
        };
    }])
    .controller('AlbumCtrl', ['$scope', function($scope) {
        $scope.album = currentAlbum;
    }]);

var currentAlbum = null;