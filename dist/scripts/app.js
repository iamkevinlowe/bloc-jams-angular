angular.module('blocJams', ['config', 'services'])
    .controller('MainCtrl', ['$scope', function($scope) {
        $scope.bodyClass = '';
        $scope.$on('$stateChangeSuccess', function(event, toState) {
            $scope.bodyClass = toState.data.bodyClass;
        });
    }])
    .controller('LandingCtrl', ['$scope', function($scope) {
        $scope.tagLine = "Turn the music up!";
        $scope.points = [
            {
                icon: 'ion-music-note',
                title: 'Choose your music',
                description: 'The world is full of music; why should you have to listen to music that someone else chose?'
            },
            {
                icon: 'ion-radio-waves',
                title: 'Unlimited, streaming, ad-free',
                description: 'No arbitrary limits. No distractions.'
            },
            {
                icon: 'ion-iphone',
                title: 'Mobile enabled',
                description: 'Listen to your music on the go. This streaming service is available on all mobile platforms.'
            }];
    }])
    .controller('CollectionCtrl', ['$scope', 'SongPlayer', function($scope, SongPlayer) {
        $scope.albums = SongPlayer.getAlbums();
        
        $scope.setAlbum = function($index) {
            SongPlayer.setCurrentAlbumIndex($index);
        };
    }])
    .controller('AlbumCtrl', ['$scope', 'SongPlayer', function($scope, SongPlayer) {
        $scope.album = SongPlayer.getAlbums()[SongPlayer.getCurrentAlbumIndex()];
        $scope.song = SongPlayer.getSong();
        
        $scope.$on("$destroy", function() {
            SongPlayer.setCurrentAlbumIndex(null);
        });
    }])
    .directive('sellingPoints', [function() {
        var animatePoints = function(point) {
            angular.element(point).css({
                opacity: 1,
                transform: 'scaleX(1) translateY(0)'
            });
        };
        
        function link(scope, element, attrs) {
            points = element[0].children;

            if ($(window).height() > 950) {
                angular.forEach(points, function(point) {
                    animatePoints(point);
                });
            }
            
            var scrollDistance = $('.selling-points').offset().top - $(window).height() + 200;

            $(window).scroll(function(event) {
                if ($(window).scrollTop() >= scrollDistance) {
                    angular.forEach(points, function(point) {
                        animatePoints(point);
                    });
                }
            });
        }
        
        return {
            restrict: 'A',
            link: link
        };
    }])
    .directive('slider', ['$document', 'SongPlayer', function($document, SongPlayer) {
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

            SongPlayer.updateSeekPercentage(seekBar, seekBarFillRatio);
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
        var trackIndex = function(album, song) {
            return album.songs.indexOf(song);
        };
        
        var previousSong = function() {
            var currentSongIndex = trackIndex(SongPlayer.getCurrentAlbum(), SongPlayer.getSong());
            var prevSongIndex = currentSongIndex - 1;
            
            if (currentSongIndex <= 0) {
                prevSongIndex = SongPlayer.getCurrentAlbum().songs.length - 1;
            }
            
            SongPlayer.setSong(prevSongIndex + 1);
            
            if (SongPlayer.onAlbum(SongPlayer.getCurrentAlbumIndex())) {
                SongPlayer.getSongNumberCell(currentSongIndex + 1).html(currentSongIndex + 1);
                SongPlayer.getSongNumberCell(prevSongIndex + 1).html(SongPlayer.getPauseButtonTemplate);
            }
            
        };
        
        var togglePlayFromPlayerBar = function() {
            if (SongPlayer.getCurrentSoundFile()) {
                if (SongPlayer.isSongPaused()) {
                   if (SongPlayer.onAlbum(SongPlayer.getCurrentAlbumIndex())) {
                       SongPlayer.getSongNumberCell(SongPlayer.getCurrentlyPlayingSongNumber()).html(SongPlayer.getPauseButtonTemplate());
                   }
                    $(this).html(SongPlayer.getPlayerBarPauseButton());
                    SongPlayer.play();
                } else {
                   if (SongPlayer.onAlbum(SongPlayer.getCurrentAlbumIndex())) {
                       SongPlayer.getSongNumberCell(SongPlayer.getCurrentlyPlayingSongNumber()).html(SongPlayer.getPlayButtonTemplate());
                   }
                    $(this).html(SongPlayer.getPlayerBarPlayButton());
                    SongPlayer.pause();
                }
            } else {
                SongPlayer.setSong(1);
                
                if (SongPlayer.onAlbum(SongPlayer.getCurrentAlbumIndex())) {
                    SongPlayer.getSongNumberCell(1).html(SongPlayer.getPauseButtonTemplate());
                    $(this).html(SongPlayer.getPlayerBarPauseButton());
                }
            }
        };
        
        var nextSong = function() {
            var currentSongIndex = trackIndex(SongPlayer.getCurrentAlbum(), SongPlayer.getSong());
            var nextSongIndex = currentSongIndex + 1;
            
            if (nextSongIndex >= SongPlayer.getCurrentAlbum().songs.length) {
                nextSongIndex = 0;
            }
            
            SongPlayer.setSong(nextSongIndex + 1);
            
            if (SongPlayer.onAlbum(SongPlayer.getCurrentAlbumIndex())) {
                SongPlayer.getSongNumberCell(currentSongIndex + 1).html(currentSongIndex + 1);
                SongPlayer.getSongNumberCell(nextSongIndex + 1).html(SongPlayer.getPauseButtonTemplate);
            }
        };
        
        function link(scope, element, attrs) {
            element.find('.previous').click(previousSong);
            element.find('.play-pause').click(togglePlayFromPlayerBar);
            element.find('.next').click(nextSong);
            
            if (SongPlayer.isSongPlaying()) {
                $('.play-pause').html(SongPlayer.getPlayerBarPauseButton());
            } else {
                $('.play-pause').html(SongPlayer.getPlayerBarPlayButton());
            }
        }
        
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/player-controls.html',
            link: link
        };
    }])
    .directive('songNumber', ['SongPlayer', function(SongPlayer) {
        function link(scope, element, attrs) {
            
            var clickHandler = function() {
                var songNumber = parseInt(attrs.songNumber);
                SongPlayer.setCurrentAlbum(SongPlayer.getCurrentAlbumIndex());
                SongPlayer.updateSeekPercentage($('.volume .seek-bar'), SongPlayer.getVolume() / 100);
                if (SongPlayer.onAlbum(SongPlayer.getCurrentAlbumIndex())) {
                    if (SongPlayer.getCurrentlyPlayingSongNumber() !== null) {
                        var currentlyPlayingCell = SongPlayer.getSongNumberCell(SongPlayer.getCurrentlyPlayingSongNumber());
                        currentlyPlayingCell.html(SongPlayer.getCurrentlyPlayingSongNumber());
                    }

                    if (SongPlayer.getCurrentlyPlayingSongNumber() !== songNumber) {
                        element.html(SongPlayer.getPauseButtonTemplate());
                        SongPlayer.setSong(songNumber);
                        $('.left-controls .play-pause').html(SongPlayer.getPlayerBarPauseButton());
                    } else if (SongPlayer.getCurrentlyPlayingSongNumber() === songNumber) {
                        if (SongPlayer.isSongPaused()) {
                            element.html(SongPlayer.getPauseButtonTemplate());
                            $('.left-controls .play-pause').html(SongPlayer.getPlayerBarPauseButton());
                            SongPlayer.play();
                        } else {
                            element.html(SongPlayer.getPlayButtonTemplate());
                            $('.left-controls .play-pause').html(SongPlayer.getPlayerBarPlayButton());
                            SongPlayer.pause();
                        }
                    }
                } else {
                    element.html(SongPlayer.getPauseButtonTemplate());
                    SongPlayer.setSong(songNumber);
                    $('.left-controls .play-pause').html(SongPlayer.getPlayerBarPauseButton());
                }
            };
            
            var onHover = function() {
                var songNumber = parseInt(attrs.songNumber);
                
                if (songNumber !== SongPlayer.getCurrentlyPlayingSongNumber() ||
                   !SongPlayer.onAlbum(SongPlayer.getCurrentAlbumIndex())) {
                    element.html(SongPlayer.getPlayButtonTemplate());
                }
            };
            
            var offHover = function() {
                var songNumber = parseInt(attrs.songNumber);
                
                if (songNumber !== SongPlayer.getCurrentlyPlayingSongNumber() ||
                   !SongPlayer.onAlbum(SongPlayer.getCurrentAlbumIndex())) {
                    element.html(songNumber);
                }
            };
            
            if (SongPlayer.getAlbums()[SongPlayer.getCurrentAlbumIndex()].songs[attrs.songNumber - 1].audioUrl) {
                element.hover(onHover, offHover);
                element.click(clickHandler);
            }
            
        }
        
        return {
            restrict: 'A',
            link: link
        };
    }]);
    
angular.module('services', [])
    .value('albumData', [albumPicasso, albumMarconi, albumBeastieBoys])
    .service('SongPlayer', ['albumData', 'timeCodeFilter', function(albumData, timeCodeFilter) {
        this.currentAlbumIndex = null;
        this.currentAlbum = null;
        this.currentlyPlayingSongNumber = null;
        this.currentSongFromAlbum = null;
        this.currentSoundFile = null;
        this.currentVolume = 80;
    
        return {
            onAlbum: function(albumIndex) {
                return (this.currentAlbum === albumData[albumIndex])
            },
            updatePlayerBarSong: function() {
                var songName = this.currentSongFromAlbum.name;
                var artistName = this.currentAlbum.artist;

                $('.currently-playing .song-name').text(songName);
                $('.currently-playing .artist-name').text(artistName);
                $('.currently-playing .artist-song-mobile').text(songName + ' - ' + artistName);

                this.setTotalTimeInPlayerBar(this.currentSongFromAlbum.length);
            },
            setTotalTimeInPlayerBar: function(totalTime) {
                $('.total-time').text(timeCodeFilter(totalTime));
            },
            updateSeekBarWhileSongPlays: function() {
                var songPlayer = this;
                
                if (songPlayer.currentSoundFile) {
                    songPlayer.currentSoundFile.bind('timeupdate', function(event) {
                        var seekBarFillRatio = this.getTime() / this.getDuration();
                        var $seekBar = $('.seek-control .seek-bar');
                        
                        songPlayer.updateSeekPercentage($seekBar, seekBarFillRatio);
                        songPlayer.setCurrentTimeInPlayerBar(this.getTime());
                    });
                }
            },
            setCurrentTimeInPlayerBar: function(currentTime) {
                $('.current-time').text(timeCodeFilter(currentTime));
            },
            updateSeekPercentage: function(seekBar, seekBarFillRatio) {
                var offsetXPercent = seekBarFillRatio * 100;
                offsetXPercent = Math.max(0, offsetXPercent);
                offsetXPercent = Math.min(100, offsetXPercent);

                var percentageString = offsetXPercent + '%';
                seekBar.find('.fill').width(percentageString);
                seekBar.find('.thumb').css({left: percentageString});
            },
            getPlayButtonTemplate: function() {
                return '<a class="album-song-button"><span class="ion-play"></span></a>';
            },
            getPauseButtonTemplate: function() {
                return '<a class="album-song-button"><span class="ion-pause"></span></a>';
            },
            getPlayerBarPlayButton: function() {
                return '<span class="ion-play"></span>';
            },
            getPlayerBarPauseButton: function() {
                return '<span class="ion-pause"></span>';
            },
            getSongNumberCell: function(number) {
                return $('.song-item-number[data-song-number="' + number + '"]');
            },
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
            getCurrentAlbumIndex: function() {
                return this.currentAlbumIndex;
            },
            setCurrentAlbumIndex: function(index) {
                this.currentAlbumIndex = index;
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
                this.updateSeekBarWhileSongPlays();
                this.updatePlayerBarSong();
            },
            getCurrentSoundFile: function() {
                return this.currentSoundFile;
            },
            play: function() {
                if (this.isSongPaused()) { this.currentSoundFile.play(); }
            },
            pause: function() {
                if (this.isSongPlaying()) { this.currentSoundFile.pause(); }
            },
            setTimePosition: function(time) {
                if (this.currentSoundFile) {
                    this.currentSoundFile.setTime(time);
                }
            }
        };
    }])
    .filter('timeCode', function() {
        return function(timeInSeconds) {
            var totalSeconds = parseFloat(timeInSeconds);
            var minutes = Math.floor(totalSeconds / 60) + "";
            var seconds = Math.floor(totalSeconds % 60) + "";

            if (seconds.length <= 1) {
                seconds = "0" + seconds;
            }

            return (minutes + ":" + seconds);
        };
    });

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