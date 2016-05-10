import Ember from 'ember';
import { EKMixin, keyDown } from 'ember-keyboard';

export default Ember.Mixin.create(EKMixin, {

  tetrisScorer: Ember.inject.service(),

  activateKeyboard: Ember.on('init', function() {
    this.set('keyboardActivated', true);
  }),

  slideLeft: Ember.on(keyDown('ArrowLeft'), function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) { return; }

    this.callLockClockResetFunction(function() {
      curPiece.slide(-1);
    });
  }),

  softDrop: Ember.on(keyDown('ArrowDown'), function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) { return; }

    var didDrop = curPiece.drop();
    if ( !didDrop ) { return; }

    this.get('tetrisScorer').trigger('softDrop');
  }),

  slideRight: Ember.on(keyDown('ArrowRight'), function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) { return; }

    this.callLockClockResetFunction(function() {
      curPiece.slide(+1);
    });
  }),

  hardDrop: Ember.on(keyDown('ArrowUp'), function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) {
      this.notifyPropertyChange('curPiece');
      return;
    }

    var atBottom = false,
        dropHeight = 0;
    while ( !atBottom ) {
      atBottom = !curPiece.drop();
      if ( atBottom ) { continue; }
      dropHeight++;
    }
    this.get('tetrisScorer').trigger('hardDrop', dropHeight);

    this.lockPiece();
  }),

  rotateClockwise: Ember.on(keyDown('e'), function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) { return; }

    this.callLockClockResetFunction(function() {
      curPiece.rotate(+1);
    });
  }),

  rotateCounterClockwise: Ember.on(keyDown('q'), function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) { return; }

    this.callLockClockResetFunction(function() {
      curPiece.rotate(-1);
    });
  }),

});
