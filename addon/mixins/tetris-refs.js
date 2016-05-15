import Ember from 'ember';

import Poller from '../custom-objects/poller';
import { shuffle } from 'ember-composable-helpers/helpers/shuffle';

export default Ember.Mixin.create({

  tetrominoCatalog: Ember.inject.service(),
  tetrisTrash: Ember.inject.service(),

  needsRefill: true,

  allRefsIn: false,
  isBadRollCall: false,
  showSpawnRows: true,

  refRollCall: {
    time: false,
    speed: false,
    resize: false,
    bag: false,
    piece: false
  },


  upcomingPieces: null,

  pieceDropTimer: null,

  needsResize: true,
  resizeAttempt: 0,
  setupAttemptTimer: null,
  attempDelay: 200,
  maxAttempts: 10,
  attemptingResize: false,

  tetrominoTypes: Ember.computed.alias('tetrominoCatalog.keys'),
  tetrominoCount: Ember.computed.alias('tetrominoCatalog.count'),
  trashingLines: Ember.computed.alias('tetrisTrash.trashingLines'),

  init: function() {
    this._super();

    this.set('setupAttemptTimer', Poller.create());
    this.get('setupAttemptTimer').setInterval(this.get('attempDelay'));

    this.get('resizeService').on('debouncedDidResize', this, this.handleResizeEvent);

    this.set('pieceDropTimer', Poller.create());

    if ( !this.get('upcomingPieces') ) { this.set('upcomingPieces', Ember.A()); }

    return true;
  },

  handleResizeEvent: function() {
    var oldNeedsResize = this.get('needsResize'),
        newNeedsResize = true;

    if ( oldNeedsResize === newNeedsResize ) {
      this.notifyPropertyChange('needsResize');
    } else {
      this.set('needsResize', newNeedsResize);
    }
  },

  coordinateRefs: function(refType) {
    if ( this.get('allRefsIn') ) { return true; }

    var refRollCall = this.get('refRollCall');
    refRollCall[refType] = true;

    var allRefsIn = true,
        refArray = Object.keys(refRollCall),
        arrayLength = refArray.length,
        curRefType,
        curRefIn;

    for (var i = 0; i < arrayLength; i++) {
      curRefType = refArray[i];
      curRefIn = refRollCall[curRefType];
      if ( curRefIn ) { continue; }

      allRefsIn = false;
      break;
    }

    if ( allRefsIn ) {
      Ember.run.scheduleOnce('afterRender', this, function() {
        if ( this.get('allRefsIn') ) { return; }
        this.set('allRefsIn', true);
      });
    }

    return allRefsIn;
  },

  resizeRef: Ember.on('init', Ember.observer('allRefsIn', 'numRows', 'numCols', 'needsResize', function() {
    if ( this.get('isBadRollCall') ) { return; }

    var numCols = this.get('numCols'),
        numRows = this.get('numRows'),
        needsResize = this.get('needsResize');

    if ( !numCols || !numRows || !needsResize ) { return; }
    if ( !this.coordinateRefs('resize') ) { return; }

    if ( this.get('attemptingResize') ) { return; }
    this.set('attemptingResize', true);

    this.get('setupAttemptTimer').start(this, function() {

      var resizeAttempt = this.get('resizeAttempt'),
          maxAttempts = this.get('maxAttempts');

      resizeAttempt++;
      if ( resizeAttempt > maxAttempts ) {
        this.get('setupAttemptTimer').stop();
        this.setProperties({
          attemptingResize: false,
          isBadRollCall: true
        });
        return;
      }

      if ( this.resizeGrid() ) {
        this.get('setupAttemptTimer').stop();
        this.setProperties({
          attemptingResize: false,
          needsResize: false
        });
        return;
      }

      this.set('resizeAttempt', resizeAttempt);

    });

  })),

  speedRef: Ember.on('init', Ember.observer('allRefsIn', 'gameSpeed', function() {
    if ( this.get('isBadRollCall') ) { return; }

    var gameSpeed = this.get('gameSpeed');
    if ( typeof gameSpeed === 'undefined' ) { return; }

    if ( !this.coordinateRefs('speed') ) { return; }

    this.get('pieceDropTimer').setInterval(gameSpeed);
  })),

  timeRef: Ember.on('init', Ember.observer('allRefsIn', 'isLive', function() {
    if ( this.get('isBadRollCall') ) { return; }

    var isLive = this.get('isLive');
    if ( typeof isLive === 'undefined' ) { return; }
    if ( !this.coordinateRefs('time') ) { return; }

    if ( isLive ) {
      this.get('pieceDropTimer').start(this, this.dropPiece);
    } else {
      this.get('pieceDropTimer').stop();
    }
  })),

  bagRef: Ember.on('init', Ember.observer('allRefsIn', 'needsRefill', 'tetrominoTypes', function() {
    if ( this.get('isBadRollCall') ) { return; }

    var upcomingPieces = this.get('upcomingPieces');
    if ( typeof upcomingPieces === 'undefined' ) { return; }
    if ( !this.coordinateRefs('bag') ) { return; }

    if ( !this.get('needsRefill') ) { return; }
    var tetrominoTypes = shuffle(this.get('tetrominoTypes'));
    upcomingPieces.pushObjects(tetrominoTypes);

    if ( !this.get('curPiece') ) { this.notifyPropertyChange('needsPiece'); }
    this.set('needsRefill', false);
  })),

  pieceRef: Ember.on('init', Ember.observer('allRefsIn', 'needsPiece', 'trashingLines', function() {
    if ( this.get('isBadRollCall') ) { return; }

    if ( !this.get('needsPiece') ) { return; }
    if ( !this.coordinateRefs('piece') ) { return; }
    if ( this.get('trashingLines') ) { return; }
    if ( this.get('curPiece') || this.get('makingPiece') ) { return; }

    var upcomingPieces = this.get('upcomingPieces');
    if ( upcomingPieces.length < 1 ) { return; }
    this.set('makingPiece', true);

    var nextPiece = upcomingPieces.pop(),
        piecesLeft = upcomingPieces.length;
    if ( piecesLeft < this.get('tetrominoCount') ) { this.set('needsRefill', true); }

    var tetrominoBlueprint = this.get('tetrominoCatalog').select(nextPiece),
        pieceBlocks = tetrominoBlueprint.blocks,
        blockCount = pieceBlocks.length,
        blockRollCall = Array(blockCount).fill(false),
        component = this;

    this.set('blockRollCall', blockRollCall);

    var refFrameOffset;
    if ( tetrominoBlueprint.isOddWidth ) {
      refFrameOffset = 1.0;
    } else if ( tetrominoBlueprint.radius === 1 ) {
      refFrameOffset = 1.5;
    } else {
      refFrameOffset = 0.5;
    }

    var pieceParams = {
      color: tetrominoBlueprint.color,
      shade: tetrominoBlueprint.shade,
      isOddWidth: tetrominoBlueprint.isOddWidth,
      i: refFrameOffset + 19,
      j: refFrameOffset + 2 + tetrominoBlueprint.radius
    };

    var curPiece = this.get('store').createRecord('tetris/piece', pieceParams);

    curPiece.save().then(function(pieceResponse) {
      var blockBlueprint, didCreateBlock;

      for (var i = 0; i < blockCount; i++) {
        blockBlueprint = pieceBlocks[i];
        didCreateBlock = component.createBlockForPiece(i, blockBlueprint, pieceResponse);
        if ( !didCreateBlock ) { break; }
      }

      if ( !didCreateBlock ) {
        component.callGameOver();
        return;
      }

      component.set('newPiece', pieceResponse);
    });

  })),

  createBlockForPiece: function(curIndex, blockBlueprint, piece) {
    var pieceI = piece.get('i'),
        pieceJ = piece.get('j'),
        blockY = blockBlueprint.y,
        blockX = blockBlueprint.x;

    var block = this.get('store').createRecord('tetris/block', {
      y: blockY, x: blockX
    });

    var blockI = block.getGridDimFromNewPieceDim(pieceI, 'i'),
        blockJ = block.getGridDimFromNewPieceDim(pieceJ, 'j'),
        cellSelector = `.cs-tetris-grid__row__${blockI} .cs-tetris-grid__col__${blockJ}`,
        currentCell = Ember.$(cellSelector);

    if ( currentCell.hasClass('cs-tetris-grid__block') ) { return false; }

    var component = this;
    block.save().then(
      function(blockResponse) {
        component.get('blockRollCall')[curIndex] = blockResponse;
        component.notifyPropertyChange('blockRollCall');
      }
    );

    return true;
  },

  handleNewPieceEvent: Ember.observer('curPiece', function() {
    if ( this.get('curPiece') ) { return; }
    this.set('needsPiece', true);
  }),

  handleNewBlockEvent: Ember.observer('blockRollCall', function() {
    var blockRollCall = this.get('blockRollCall');
    if ( blockRollCall.some(elem => elem === false) ) { return; }

    var newPiece = this.get('newPiece'),
        child = this.get('child'),
        component = this;

    newPiece.get('blocks').then(function(blocks) {
      blocks.pushObjects(blockRollCall);
    });

    if ( child.save ) {
      this.addPiece(component, child, newPiece);
    } else {
      child.then(function(childResponse) {
        component.addPiece(component, childResponse, newPiece);
      });
    }
  }),

  addPiece: function(component, child, newPiece) {
    newPiece.save().then(function(curPiece) {
      child.get('pieces').then(function(pieces) {
        pieces.pushObject(curPiece);

        component.saveRelationships(0, function() {
          component.setProperties({
            curPiece: curPiece,
            makingPiece: false,
            needsPiece: false
          });
        });
      });
    });
  },

  resizeGrid: function() {
    if ( Ember.$('.cs-tetris-grid__col').length <= 0 ) { return; }
    if ( Ember.$('.cs-tetris-grid__row').length <= 0 ) { return; }

    var numCols = this.get('numCols'),
        numRows = this.get('numRows');

    if ( !numCols || !numRows ) { return; }

    if ( this.get('showSpawnRows') ) {
      var superRows = this.get('superRows');
      if ( !superRows ) { return; }
      numRows += superRows;
    }

    var height = this.$().height(),
        sideMargin = this.$().parent().width(),
        width = height * ( numCols / numRows ),
        colWidth = width / numCols,
        rowHeight = height / numRows;

    sideMargin = 0.5 * ( sideMargin - width );

    Ember.$('.cs-tetris-board__sidebar').css('width', sideMargin + 'px');
    Ember.$('.cs-tetris-board__sidebar').css('margin-top', -height + 'px');

    Ember.$('.cs-tetris-grid').css('position', 'relative');

    Ember.$('.cs-tetris-grid').css('margin-left', sideMargin + 'px');
    Ember.$('.cs-tetris-grid').css('width', width + 'px');

    Ember.$('.cs-tetris-grid__col').css('width', colWidth + 'px');
    Ember.$('.cs-tetris-grid__row').css('height', rowHeight + 'px');

    Ember.$('.cs-tetris-grid__row').css('width', width + 'px');
    Ember.$('.cs-tetris-grid__col').css('height', rowHeight + 'px');

    Ember.$('.cs-tetris-grid__row').css('position', 'absolute');
    Ember.$('.cs-tetris-grid__col').css('position', 'absolute');

    var curTop;
    for (var i = 0; i < numRows; i++) {
      curTop = ( numRows - ( i + 1 ) ) * rowHeight;
      Ember.$(`.cs-tetris-grid__row__${i}`).css('top', curTop);
    }

    var curLeft;
    for (var j = 0; j < numCols; j++) {
      curLeft = j * colWidth;
      Ember.$(`.cs-tetris-grid__col__${j}`).css('left', curLeft);
    }

    if ( sideMargin < 0 ) { throw 'Invalid tetris margin dimensions'; }

    return true;
  }

});
