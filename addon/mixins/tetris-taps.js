import Ember from 'ember';
import TetrisActionsMixin from './tetris-actions';
import RecognizerMixin from 'ember-gestures/mixins/recognizers';

export default Ember.Mixin.create(TetrisActionsMixin, RecognizerMixin, {

  recognizers: 'swipe tap',

  swipeLeft: function() {
    debugger
    this.slideLeft();
  },

  swipeDown: function() {
    this.hardDrop();
  },

  swipeRight: function() {
    this.slideRight();
  },

  swipeUp: function() {
    debugger
  },

  tap: function(tapEvent) {
    var tappedColumn = tapEvent.target.className,
        columnInfo = tappedColumn.match(/cs-tetris-grid__col__\d/);

    if ( !columnInfo ) { return; }

    var columnIndex = parseInt(columnInfo[0].replace('cs-tetris-grid__col__', '')),
        lastLeftIndex = this.get('child').get('numCols')/2;

    if ( columnIndex <= lastLeftIndex ) {
      this.rotateCounterClockwise();
    } else {
      this.rotateClockwise();
    }
  },

});
