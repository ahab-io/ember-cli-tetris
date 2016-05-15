import Ember from 'ember';

export default Ember.Mixin.create({

  tetrisScorer: Ember.inject.service(),

  slideLeft: function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) { return; }

    this.callLockClockResetFunction(function() {
      curPiece.slide(-1);
    });
  },

  softDrop: function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) { return; }

    var didDrop = curPiece.drop();
    if ( !didDrop ) { return; }

    this.get('tetrisScorer').trigger('softDrop');
  },

  slideRight: function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) { return; }

    this.callLockClockResetFunction(function() {
      curPiece.slide(+1);
    });
  },

  hardDrop: function() {
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
  },

  rotateClockwise: function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) { return; }

    this.callLockClockResetFunction(function() {
      curPiece.rotate(+1);
    });
  },

  rotateCounterClockwise: function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) { return; }

    this.callLockClockResetFunction(function() {
      curPiece.rotate(-1);
    });
  }

});
