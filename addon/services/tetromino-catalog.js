import Ember from 'ember';

export default Ember.Service.extend({

  keys: null,
  count: null,
  colors: null,
  shades: null,

  extraKeys: null,
  extraCount: null,
  extraColors: null,
  extraShades: null,

  select(item) {
    return (
      this.get('pieces')[item] ||
      this.get('extraPieces')[item]
    );
  },

  init() {
    this._super(...arguments);

    var service = this;
    this.compilePieceOrders( function() { service.updateCatalog(); } );
  },

  updateCatalog: function() {
    var keys = Object.keys(this.get('pieces')),
        count = keys.length,
        colors = keys.map(key => this.select(key).color),
        shades = [];

    var extraKeys = Object.keys(this.get('extraPieces')),
        extraCount = extraKeys.length + count,
        extraColors = null;

    var extraShades = Ember.$.unique(extraKeys.map(key => this.select(key).shade));

    extraKeys.push.apply(extraKeys, keys);
    extraColors = Ember.$.unique(extraKeys.map(key => this.select(key).color));

    this.setProperties({
      keys: keys,
      count: count,
      colors: colors,
      shades: shades,
      extraKeys: extraKeys,
      extraCount: extraCount,
      extraColors: extraColors,
      extraShades: extraShades
    });
  },

  compilePieceOrders: function(callback) {

    var pieceCategories = ['pieces', 'extraPieces'],
        arrayLength = pieceCategories.length;

    for (var i = 0; i < arrayLength; i++) {

      var pieces = this.get(pieceCategories[i]),
          pieceKeys = Object.keys(pieces),
          pieceCount = pieceKeys.length;

      for (var j = 0; j < pieceCount; j++) {

        var curPiece = pieces[pieceKeys[j]],
            pieceWidth = this.compactPieceAndGetWidth(curPiece.blocks),
            appliedOffset = Math.floor( pieceWidth / 2 );

        curPiece['radius'] = appliedOffset;
        curPiece['isOddWidth'] = ( pieceWidth % 2 === 1 );

        var blockCount = curPiece.blocks.length,
            shadeAmount = blockCount - 4;
        if ( shadeAmount > 0 ) {
          curPiece['shade'] = `darken-${shadeAmount}`;
        } else if ( shadeAmount < 0 ) {
          shadeAmount *= ( -1 ) ;
          curPiece['shade'] = `lighten-${shadeAmount}`;
        } else {
          curPiece['shade'] = '';
        }

        this.offsetPiece(curPiece);

      }

    }

    callback();

  },

  offsetPiece: function(curPiece) {

    if ( curPiece['isOddWidth'] ) {

      curPiece.blocks.forEach(function(block) {
        block.x -= curPiece['radius'];
      });

    } else {

      curPiece.blocks.forEach(function(block) {
        var carryOne = ( block.x >= curPiece['radius'] );
        block.x -= curPiece['radius'];
        if (carryOne) { block.x++; }

        if ( curPiece['radius'] === 1 ) {
          if ( block.y === 0 ) { block.y--; }
        } else {
          block.y++;
        }
      });

    }
  },

  compactPieceAndGetWidth: function(blocks) {
    var xValues = blocks.map(elem => elem.x),
        minValue = Math.min(...xValues),
        pieceWidth = Math.max(...xValues) - ( minValue - 1 ) ;

    if ( minValue > 0 ) {
      blocks.forEach(function(block) {
        block.x -= minValue;
      });
    }

    return pieceWidth;
  },

  pieces: {

    i: {
      color: 'cyan',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 }
      ]
    },

    o: {
      color: 'yellow',
      blocks: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 }
      ]
    },

    s: {
      color: 'green',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 }
      ]
    },

    z: {
      color: 'red',
      blocks: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 }
      ]
    },

    j: {
      color: 'blue',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 }
      ]
    },

    t: {
      color: 'purple',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 }
      ]
    },

    l: {
      color: 'orange',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 }
      ]
    }

  },

  extraPieces:  {

    i2: {
      color: 'cyan',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 }
      ]
    },

    i3: {
      color: 'cyan',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 }
      ]
    },

    j3: {
      color: 'blue',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 }
      ]
    },

    l3: {
      color: 'orange',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 }
      ]
    },

    j5: {
      color: 'blue',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 1 }
      ]
    },

    t5l: {
      color: 'purple',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 1, y: 1 }
      ]
    },

    t5r: {
      color: 'purple',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 2, y: 1 }
      ]
    },

    l5: {
      color: 'orange',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 3, y: 1 }
      ]
    },

    s5: {
      color: 'green',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 3, y: 1 }
      ]
    },

    z5: {
      color: 'red',
      blocks: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 }
      ]
    },

    p: {
      color: 'pink',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 }
      ]
    },

    q: {
      color: 'indigo',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 }
      ]
    },

    u: {
      color: 'brown',
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 2, y: 1 }
      ]
    },

  }

});
