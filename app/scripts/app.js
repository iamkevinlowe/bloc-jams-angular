angular.module('blocJams', ['config', 'services'])
    .controller('MainCtrl', ['$scope', function($scope) {
        
        $scope.bodyClass = '';
        
        $scope.$on('$stateChangeSuccess', function(event, toState) {
            $scope.bodyClass = toState.data.bodyClass;
        });
        
    }])
    .controller('LandingCtrl', ['$scope', function($scope) {
        
        $scope.tagLine = "Turn the music up!";
        
    }])
    .controller('CollectionCtrl', ['$scope', 'albumView', 'SongPlayer', function($scope, albumView, SongPlayer) {
        
        $scope.albums = SongPlayer.getAlbums();
        
        $scope.setAlbum = function($index) {
            albumView.currentAlbumView = $scope.albums[$index];
            if (!SongPlayer.isSongPlaying()) {
                SongPlayer.setCurrentAlbum($index);
            }
        };
        
    }])
    .controller('AlbumCtrl', ['$scope', 'albumView', 'SongPlayer', function($scope, albumView, SongPlayer) {
        
        $scope.albumView = albumView.currentAlbumView;
        $scope.albumPlaying = SongPlayer.getCurrentAlbum();
        $scope.songPlaying = SongPlayer.getSong();
        
        $scope.setSong = function(songNumber) {
            SongPlayer.setSong(songNumber);
        };
        $scope.previousSong = function() {
            SongPlayer.previousSong();
        };
        $scope.nextSong = function() {
            SongPlayer.nextSong();
        };
        $scope.togglePlay = function() {
            if (SongPlayer.isSongPaused()) {
                SongPlayer.play();
            } else if (SongPlayer.isSongPlaying()) {
                SongPlayer.pause();
            }
        };
        $scope.setVolume = function(volume) {
            SongPlayer.setVolume(volume);
        };
        
    }])
    .directive('slider', ['$document', 'SongPlayer', function($document, SongPlayer) {
        
        function updateSeekPercentage(seekBar, seekBarFillRatio) {
            var offsetXPercent = seekBarFillRatio * 100;
            offsetXPercent = Math.max(0, offsetXPercent);
            offsetXPercent = Math.min(100, offsetXPercent);

            var percentageString = offsetXPercent + '%';
            seekBar.find('.fill').width(percentageString);
            seekBar.find('.thumb').css({left: percentageString});
        }
        
        function updateSeekPosition(element, event) {
            var seekBar = element;
            
            var offsetX = event.pageX - seekBar.offset().left;
            var barWidth = seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            if(element.parent().hasClass('seek-control')) {
                SongPlayer.setTimePosition(seekBarFillRatio * SongPlayer.getCurrentSoundFile().getDuration());
            } else if (element.parent().hasClass('volume')) {
                SongPlayer.setVolume(seekBarFillRatio * 100);
            }

            updateSeekPercentage(seekBar, seekBarFillRatio);
        }
        
        function link(slider, element, attrs) {
            slider.onMouseDown = function(event) {
                $document.bind('mousemove.thumb', function(event) {
                    updateSeekPosition(element, event);
                });
                
                $document.bind('mouseup.thumb', function() {
                    $document.unbind('mousemove.thumb');
                    $document.unbind('mouseup.thumb');
                });
            };
            
            slider.onClick = function(event) {
                updateSeekPosition(element, event);
            };
        }
    
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/slider.html',
            scope: {
                slider: '=sliderId'
            },
            link: link
        };
    }])
    .directive('playerControls', ['SongPlayer', function(SongPlayer) {
        
        function link(scope, element, attrs) {
            
        }
        
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/player-controls.html',
            link: link
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
                templateUrl: 'templates/landing.html',
                data: {
                    bodyClass: 'landing'
                }
            })
            .state('collection', {
                url: '/collection',
                controller: 'CollectionCtrl',
                templateUrl: 'templates/collection.html',
                data: {
                    bodyClass: 'collection'
                }
            })
            .state('album', {
                url: '/album',
                controller: 'AlbumCtrl',
                templateUrl: 'templates/album.html',
                data: {
                    bodyClass: 'album'
                }
            });
    });
    
angular.module('services', [])
    .value('albumData', [albumPicasso, albumMarconi, albumBeastieBoys])
    .value('albumView', {
        currentAlbumView: null
    })
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
            getCurrentSoundFile: function() {
                return this.currentSoundFile;
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
                if (this.currentSoundFile) {
                    var currentSongIndex = this.currentAlbum.songs.indexOf(this.currentSongFromAlbum);
                    var prevSongIndex = --currentSongIndex;

                    if (currentSongIndex < 0) {
                        prevSongIndex = this.currentAlbum.songs.length - 1;
                    }

                    this.setSong(++prevSongIndex);
                }
            },
            nextSong: function() {
                if (this.currentSoundFile) {
                    var currentSongIndex = this.currentAlbum.songs.indexOf(this.currentSongFromAlbum);
                    var nextSongIndex = ++currentSongIndex;

                    if (nextSongIndex >= this.currentAlbum.songs.length) {
                        nextSongIndex = 0;
                    }

                    this.setSong(++nextSongIndex);
                }
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