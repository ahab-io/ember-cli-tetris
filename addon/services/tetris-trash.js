import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {

  init() {
    this._super(...arguments);

    this.on('trashBlocks', this.trashBlocks);
  },

  trashBlocks: function(blocks, piece) {
    var destroyedBlocks = [],
        service = this;

    blocks.forEach(block => destroyedBlocks.push(block.destroyRecord()));

    Ember.RSVP.all(destroyedBlocks).then(() => {
      service.trashPiece(piece);
    });
  },

  trashPiece: function(piece) {
    if ( piece.get('blocks').get('length') > 0 ) { return; }
    piece.destroyRecord();
  }

});
