import Ember from 'ember';
import TetrisActionsMixin from './tetris-actions';
import { EKMixin, keyDown } from 'ember-keyboard';

export default Ember.Mixin.create(TetrisActionsMixin, EKMixin, {

  activateKeyboard: Ember.on('init', function() {
    this.set('keyboardActivated', true);
  }),

  arrowLeft: Ember.on(keyDown('ArrowLeft'), function() {
    this.slideLeft();
  }),

  arrowDown: Ember.on(keyDown('ArrowDown'), function() {
    this.softDrop();
  }),

  arrowRight: Ember.on(keyDown('ArrowRight'), function() {
    this.slideRight();
  }),

  arrowUp: Ember.on(keyDown('ArrowUp'), function() {
    this.hardDrop();
  }),

  strafeLeft: Ember.on(keyDown('e'), function() {
    this.rotateClockwise();
  }),

  strafeRight: Ember.on(keyDown('q'), function() {
    this.rotateCounterClockwise();
  }),

});
