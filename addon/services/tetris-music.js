import Ember from 'ember';

export default Ember.Service.extend({

  music: null,
  isPlaying: false,

  init() {
    this._super(...arguments);

    var tetrisMusic = new Audio('music/tetris_music.mp3');
    tetrisMusic.loop = true;
    this.set('music', tetrisMusic);
  },

  togglePlay() {
    var isNowPlaying = !( this.get('isPlaying') );

    if ( isNowPlaying ) {
      this.play();
    } else {
      this.pause();
    }
  },

  play() {
    this.get('music').play();
    this.set('isPlaying', true);
  },

  pause() {
    this.get('music').pause();
    this.set('isPlaying', false);
  }

});
