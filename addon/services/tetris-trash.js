import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {

  init() {
    this._super(...arguments);

    this.on('trashLines', this.trashLines);
  },

  trashLines: function(blocks, pieces, component) {
    this.trashBlocks(blocks, pieces, component);
  },

  trashBlocks: function(blocks, pieces, component) {
    var destroyedBlocks = [],
        service = this;

    blocks.forEach(function(block) {
      destroyedBlocks.push(block.destroyRecord());
    });

    Ember.RSVP.all(destroyedBlocks).then(() => this.trashPieces(pieces, component));
  },

  trashPieces: function(pieces, component) {
    var destroyedPieces = [],
        service = this;

    pieces.forEach(function(piece) {
      if ( piece.get('blocks').get('length') <= 0 ) {
        destroyedPieces.push(piece.destroyRecord());
      }
    });

    Ember.RSVP.all(destroyedPieces).then(() => this.updateComponent(component));
  },

  updateComponent: function(component) {
    // debugger
    // remove piece from grid pieces
    component.saveRelationships(0);
  }

  // trashBlocks: function(blocks, piece) {
  //   var destroyedBlocks = [],
  //       service = this;

  //   blocks.forEach(block => destroyedBlocks.push(block.destroyRecord()));

  //   Ember.RSVP.all(destroyedBlocks).then(() => {
  //     service.trashPiece(piece);
  //   });
  // },

  // trashPiece: function(piece) {
  //   if ( piece.get('blocks').get('length') > 0 ) { return; }
  //   piece.destroyRecord();
  // }

});
