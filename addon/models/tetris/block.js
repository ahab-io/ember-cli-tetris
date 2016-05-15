/*global Ember, DS */

import TetrisModel from '../tetris-model';

export default TetrisModel.extend({

  parent: Ember.computed.alias('piece'),
  piece: DS.belongsTo('tetris/piece'),

  x: DS.attr('number'),
  y: DS.attr('number'),

  isOddWidth: Ember.computed.alias('piece.isOddWidth'),
  color: Ember.computed.alias('piece.color'),
  shade: Ember.computed.alias('piece.shade'),

  coords: Ember.computed('i', 'j', function() {
    var i = this.get('i'),
        j = this.get('j');

    return [ i, j ];
  }),

  i: Ember.computed('isOddWidth', 'y', 'piece.i', function() {
    var pieceDim = this.get('piece').get('i'),
        blockDim = this.get('y');

    return this.calcDimForGridRefFrame(pieceDim, blockDim);
  }),

  j: Ember.computed('isOddWidth', 'piece.j', 'x', function() {
    var pieceDim = this.get('piece').get('j'),
        blockDim = this.get('x');

    return this.calcDimForGridRefFrame(pieceDim, blockDim);
  }),

  getGridDimFromNewPieceDim: function(pieceDim, dimType) {
    var blockDimType = ( dimType === 'i' ) ? 'y' : 'x' ,
        blockDim = this.get(blockDimType);

    return this.calcDimForGridRefFrame(pieceDim, blockDim);
  },

  getGridDimFromNewBlockDim: function(blockDim, dimType) {
    var pieceDimType = ( dimType === 'y' ) ? 'i' : 'j' ,
        pieceDim = this.get('piece').get(pieceDimType);

    return this.calcDimForGridRefFrame(pieceDim, blockDim);
  },

  calcDimForGridRefFrame: function(pieceDim, blockDim) {
    var calcDim = pieceDim + blockDim;

    if ( this.get('isOddWidth') ) { return calcDim; }

    if ( blockDim > 0 ) {
      calcDim = Math.floor(calcDim);
    } else {
      calcDim = Math.ceil(calcDim);
    }

    return calcDim;
  }

});
