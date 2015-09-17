angular.module('blocJams', ['config', 'services'])
    .controller('LandingCtrl', ['$scope', function($scope) {
        
        $scope.tagLine = "Turn the music up!";
        
    }])
    .controller('CollectionCtrl', ['$scope', 'SongPlayer', function($scope, SongPlayer) {
        
        $scope.albums = SongPlayer.getAlbums();
        
        $scope.setAlbum = function($index) {
            SongPlayer.setCurrentAlbum($index);
        };
        
    }])
    .controller('AlbumCtrl', ['$scope', 'SongPlayer', function($scope, SongPlayer) {
        
        $scope.album = SongPlayer.getCurrentAlbum();
        $scope.song = SongPlayer.getSong();
        $scope.timePosition = function() {
            while (SongPlayer.isSongPlaying()) {
                return SongPlayer.getTimePosition();
            }
        };
        
        $scope.setSong = function(songNumber) {
            SongPlayer.setSong(songNumber);
        };
        $scope.previousSong = function() {
            SongPlayer.previousSong();
        };
        $scope.nextSong = function() {
            SongPlayer.nextSong();
        };
        $scope.play = function() {
            SongPlayer.play();
        };
        $scope.pause = function() {
            SongPlayer.pause();
        };
        $scope.setVolume = function(volume) {
            SongPlayer.setVolume(volume);
        };
        
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
    
angular.module('services', [])
    .value('albumData', [albumPicasso, albumMarconi, albumBeastieBoys])
    .service('SongPlayer', ['albumData', function(albumData) {
        this.currentAlbum = null;
        this.currentlyPlayingSongNumber = null;
        this.currentSongFromAlbum = null;
        this.currentSoundFile = null;
        this.currentVolume = 80;
    
        return {
            isSongPlaying: function() {
                return (this.currentSoundFile && !this.currentSoundFile.isPaused());
            },
            isSongPaused: function() {
                return (this.currentSoundFile && this.currentSoundFile.isPaused());
            },
            getCurrentlyPlayingSongNumber: function() {
                return this.currentlyPlayingSongNumber;
            },
            getAlbums: function() {
                return albumData;
            },
            getCurrentAlbum: function() {
                return this.currentAlbum;
            },
            setCurrentAlbum: function(index) {
                this.currentAlbum = albumData[index];
            },
            setVolume: function(volume) {
                this.currentVolume = volume;

                if (this.currentSoundFile) {
                    this.currentSoundFile.setVolume(volume);
                }
            },
            getVolume: function() {
                return this.currentVolume;  
            },
            getSong: function() {
                return this.currentSongFromAlbum;
            },
            setSong: function(songNumber) {
                if (this.currentSoundFile) {
                    this.currentSoundFile.stop();
                }

                this.currentlyPlayingSongNumber = songNumber;
                this.currentSongFromAlbum = this.currentAlbum.songs[--songNumber];

                this.currentSoundFile = new buzz.sound(this.currentSongFromAlbum.audioUrl, {
                    formats: ['mp3'],
                    preload: true
                });

                this.setVolume(this.currentVolume || 80);
                this.currentSoundFile.play();
            },
            previousSong: function() {
                var currentSongIndex = this.currentAlbum.songs.indexOf(this.currentSongFromAlbum);
                var prevSongIndex = --currentSongIndex;

                if (currentSongIndex < 0) {
                    prevSongIndex = this.currentAlbum.songs.length - 1;
                }

                this.setSong(++prevSongIndex);
            },
            nextSong: function() {
                var currentSongIndex = this.currentAlbum.songs.indexOf(this.currentSongFromAlbum);
                var nextSongIndex = ++currentSongIndex;

                if (nextSongIndex >= this.currentAlbum.songs.length) {
                    nextSongIndex = 0;
                }

                this.setSong(++nextSongIndex);
            },
            play: function() {
                if (this.isSongPaused()) { this.currentSoundFile.play(); }
            },
            pause: function() {
                if (this.isSongPlaying()) { this.currentSoundFile.pause(); }
            },
            getTimePosition: function() {
                return this.currentSoundFile.getTime();
            },
            setTimePosition: function(time) {
                if (this.currentSoundFile) {
                    this.currentSoundFile.setTime(time);
                }
            }
        };
    }]);