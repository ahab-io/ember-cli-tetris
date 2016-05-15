  /*global Ember, DS */

import TetrisModel from '../tetris-model';

export default TetrisModel.extend({
  parent: Ember.computed.alias('grid'),
  grid: DS.belongsTo('tetris/grid'),
  blocks: DS.hasMany('tetris/block'),
  color: DS.attr('string'),
  shade: DS.attr('string'),
  isOddWidth: DS.attr('boolean'),
  i: DS.attr('number'),
  j: DS.attr('number'),

  drop: function() {
    var newPositions = [],
        model = this;

    this.get('blocks').forEach(function(block) {
      var oldI = block.get('i'),
          oldJ = block.get('j'),
          newPieceI = model.get('i') - 1,
          newI = block.getGridDimFromNewPieceDim(newPieceI, 'i'),
          newJ = oldJ;

      newPositions.push({
        block: block,
        oldI: oldI, oldJ: oldJ,
        newI: newI, newJ: newJ
      });
    });

    var isValidMove = this.checkPositions(newPositions);
    if ( isValidMove ) {
      var i = this.get('i');
      i--;
      this.set('i', i);
    }
    return isValidMove;
  },

  slide: function(direction) {
    var newPositions = [],
        model = this;

    this.get('blocks').forEach(function(block) {
      var oldI = block.get('i'),
          oldJ = block.get('j'),
          newPieceJ = model.get('j') + direction,
          newI = oldI,
          newJ = block.getGridDimFromNewPieceDim(newPieceJ, 'j');

      newPositions.push({
        block: block,
        oldI: oldI, oldJ: oldJ,
        newI: newI, newJ: newJ
      });
    });

    var isValidMove = this.checkPositions(newPositions);
    if ( isValidMove ) {
      var j = this.get('j');
      j += direction;
      this.set('j', j);
    }
    return isValidMove;
  },

  rotate: function(direction) {
    var newPositions = [];

    this.get('blocks').forEach(function(block) {
      var oldI = block.get('i'),
          oldJ = block.get('j'),
          newBlockY = (-1) * direction * block.get('x'),
          newBlockX = (+1) * direction * block.get('y'),
          newI = block.getGridDimFromNewBlockDim(newBlockY, 'y'),
          newJ = block.getGridDimFromNewBlockDim(newBlockX, 'x');

      newPositions.push({
        block: block,
        oldI: oldI, oldJ: oldJ,
        newI: newI, newJ: newJ
      });
    });

    var isValidMove = this.checkPositions(newPositions);

    if ( isValidMove ) {
      this.get('blocks').forEach(function(block) {
        block.setProperties({
          y: (-1) * direction * block.get('x'),
          x: (+1) * direction * block.get('y')
        });
      });
    }
    return isValidMove;
  },

  checkPositions: function(positions) {
    var arrayLength = positions.length,
        stayFilledCells = [],
        oldI, oldJ, newI, newJ,
        currentCell, staysFilled;

    for (var i = 0; i < arrayLength; i++) {
      staysFilled = false;

      newI = positions[i].newI;
      newJ = positions[i].newJ;

      if ( newI < 0 ) { return false; }
      if ( newJ < 0 ) { return false; }
      if ( newJ >= this.get('grid').get('numCols') ) { return false; }

      for (var j = 0; j < arrayLength; j++) {
        oldI = positions[j].oldI;
        oldJ = positions[j].oldJ;
        if ( oldI === newI && oldJ === newJ ) {
          staysFilled = true;
          break;
        }
      }

      currentCell = Ember.$(`.cs-tetris-grid__row__${newI} .cs-tetris-grid__col__${newJ}`);
      if ( !currentCell.hasClass('cs-tetris-grid__block') ) { continue; }

      if ( !staysFilled ) { return false; }
      if ( i !== j ) { stayFilledCells.push(currentCell); }
    }

    arrayLength = stayFilledCells.length;
    var filledClasses = [ 'filled', 'same-color', 'same-shade'],
        classListString = filledClasses.map(elem => `js-tetris-grid__block__stays-${elem}`).join(' ');

    for (i = 0; i < arrayLength; i++) {
      stayFilledCells[i].addClass(classListString);
    }

    return true;
  }

});
