/*global Ember */
import layout from '../templates/components/tetris-board';
import TetrisComponent from './tetris-component';

export default TetrisComponent.extend({
  layout,

  tetrisScorer: Ember.inject.service(),
  tetrisMusic: Ember.inject.service(),

  level: Ember.computed.alias('tetrisScorer.level'),
  score: Ember.computed.alias('tetrisScorer.score'),
  lines: Ember.computed.alias('tetrisScorer.lines'),
  isLive: Ember.computed.alias('game.isLive'),
  isPlayingMusic: Ember.computed.alias('tetrisMusic.isPlaying'),

  actions: {
    togglePlay: function() {
      this.set('isLive', !this.get('isLive'));
    },

    toggleMusic: function() {
      this.get('tetrisMusic').togglePlay();
    }
  },

});
