import Ember from 'ember';
import layout from '../templates/components/tetris-grid';

import TetrisComponent from './tetris-component';
import TetrisKeysMixin from '../mixins/tetris-keys';
import TetrisRefsMixin from '../mixins/tetris-refs';
import TetrisTapsMixin from '../mixins/tetris-taps';

import Poller from '../custom-objects/poller';

export default TetrisComponent.extend(TetrisKeysMixin, TetrisRefsMixin, TetrisTapsMixin, {
  layout,

  tetrisScorer: Ember.inject.service(),
  tetrisTrash: Ember.inject.service(),

  classNames: ['cs-tetris-grid'],

  needsPiece: true,

  makingPiece: false,
  lockingPiece: false,

  lockDelay: 500,

  curPiece: null,
  newPiece: null,

  pieceLockTimer: null,

  currentTime: Ember.computed('currentTimePulse', function() {
    var date = new Date();
    return date.toString();
  }),

  didInsertElement: function() {
    this._super();

    this.set('pieceLockTimer', Poller.create());
    this.get('pieceLockTimer').setInterval(this.get('lockDelay'));

    return true;
  },

  level: Ember.computed.alias('tetrisScorer.level'),
  isLive: Ember.computed.alias('game.isLive'),
  pieces: Ember.computed.alias('child.pieces'),

  gameSpeed: Ember.computed('level', function() {
    var level = this.get('level');
    if ( !level ) { return; }

    var gameSpeed = 1000 - 300 * Math.log(level);
    return gameSpeed;
  }),

  numRows: Ember.computed.alias('child.numRows'),
  superRows: Ember.computed.alias('child.extraTopRows'),
  subRows: Ember.computed.alias('child.extraBotRows'),
  numCols: Ember.computed.alias('child.numCols'),

  callLockClockResetFunction: function(callback) {
    if ( !this.get('lockingPiece') ) {
      callback();
      return;
    }

    this.get('pieceLockTimer').stop();
    callback();
    this.get('pieceLockTimer').start(this, this.lockPiece);
  },

  lockPiece: function() {
    this.get('pieceLockTimer').stop();

    var component = this;
    this.checkForLineClears(function() {
      component.setProperties({
        curPiece: null,
        lockingPiece: false
      });
    });
  },

  checkForLineClears: function(callback) {
    var blocks = this.get('curPiece').get('blocks'),
        touchedRows = blocks.map(elem => elem.get('i')).uniq(),
        arrayLength = touchedRows.length,
        numCols = this.get('numCols'),
        clearedRows = [];

    var curRow, isClear, cellSelector, currentCell;

    for (var i = 0; i < arrayLength; i++) {
      curRow = touchedRows[i];

      isClear = true;
      for (var j = 0; j < numCols; j++) {
        cellSelector = `.cs-tetris-grid__row__${curRow} .cs-tetris-grid__col__${j}`;
        currentCell = Ember.$(cellSelector);
        if ( currentCell.hasClass('cs-tetris-grid__block') ) { continue; }

        isClear = false;
        break;
      }

      if ( !isClear ) { continue; }

      clearedRows.push(curRow);
    }

    if ( clearedRows.length === 0 ) {
      callback();
      return;
    }

    this.clearLines(clearedRows, callback);
  },

  clearLines(clearedRows, callback) {
    var destroyedBlocks = [],
        partialPieces = [],
        component = this;

    this.get('pieces').forEach(function(piece) {
      piece.get('blocks').forEach(function(block) {
        var blockRow = block.get('i'),
            clearedRows = this;

        if ( Ember.$.inArray(blockRow, clearedRows) !== -1 ) {
          destroyedBlocks.push(block);
        }
      }, clearedRows);

      if ( destroyedBlocks.length > 0 ) {
        piece.get('blocks').removeObjects(destroyedBlocks);
        partialPieces.push(piece);
      }
    });

    component.get('tetrisTrash').trigger('trashLines', destroyedBlocks, partialPieces, component);
    this.setFillStays(clearedRows, callback);
  },

  setFillStays(clearedRows, callback) {
    this.get('pieces').forEach(function(piece) {
      piece.get('blocks').forEach(function(block) {

        var botI = block.get('i'),
            botJ = block.get('j'),
            botCell = Ember.$(`.cs-tetris-grid__row__${botI} .cs-tetris-grid__col__${botJ}`);

        var clearedRows = this,
            droppedRows = clearedRows.filter(function(curI){ return botI > curI; }).length,
            topRowHeight = piece.get('i') + droppedRows;

        var topI = block.getGridDimFromNewPieceDim(topRowHeight, 'i'),
            topJ = botJ,
            topCell = Ember.$(`.cs-tetris-grid__row__${topI} .cs-tetris-grid__col__${topJ}`);

        var fill = 'cs-tetris-grid__block',
            color = block.get('color'),
            shade = block.get('shade'),
            safetyFill = 'js-tetris-grid__block__stays-filled',
            safetyColor = 'js-tetris-grid__block__stays-same-color',
            safetyShade = 'js-tetris-grid__block__stays-same-shade';

        if ( botI !== topI || botJ !== topJ ) {
          if ( topCell.hasClass(fill) ) { botCell.addClass(safetyFill); }
          if ( topCell.hasClass(color) ) { botCell.addClass(safetyColor); }
          if ( topCell.hasClass(shade) ) { botCell.addClass(safetyShade); }
        }
      }, clearedRows);
    });

    this.moveLinesDown(clearedRows, callback);
  },

  moveLinesDown(clearedRows, callback) {
    this.get('pieces').forEach(function(piece) {
      piece.get('blocks').forEach(function(block) {
        var blockRow = block.get('i'),
            clearedRows = this,
            droppedRows = clearedRows.filter(function(row){ return blockRow > row; }).length,
            oldY = block.get('y'),
            newY = oldY - droppedRows,
            isOddWidth = piece.get('isOddWidth');

        if ( !isOddWidth ) {
          if ( oldY > 0 && newY <= 0 ) { newY--; }
          if ( oldY === 0 || newY === 0 ) { throw 'Invalid tetris piece location'; }
        }
        block.set('y', newY);
      }, clearedRows);
    });

    this.get('tetrisScorer').trigger('lineClear', clearedRows.length);
    callback();
  },

  dropPiece: function() {
    var curPiece = this.get('curPiece');
    if ( !curPiece ) { return; }

    var didDrop = curPiece.drop();
    if ( didDrop ) { return; }

    if ( this.get('lockingPiece') ) { return; }
    this.set('lockingPiece', true);

    this.get('pieceLockTimer').start(this, this.lockPiece);
  },

  callGameOver: function() {
    this.set('isLive', false);
    this.$().addClass('cs-tetris-game-over');
  }

});
