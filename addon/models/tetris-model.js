/*exported Ember, DS */

import Ember from 'ember';
import Model from 'ember-data/model';
import DS from 'ember-data';

export default Model.extend({
  parent: null,
  rev: DS.attr('string'), // for ember-pouch

  recursiveSave: function(callback) {
    var asdf = Ember.inspect(this).match(/tetris\/.*(?=::ember)/)[0].replace('tetris/', '');
    // if ( asdf == 'player' && !this.get('parent') ) debugger
    console.log('recursive - ' + asdf + ' - ' + this.get('parent'))
    var parent = this.get('parent');
    if ( parent ) {
      if ( parent.recursiveSave ) {
        this.save().then(() => parent.recursiveSave(callback));
      } else {
        parent.then((parentResponse) => parentResponse.recursiveSave(callback))
      }
    } else {
      this.save().then(callback);
    }
  }
});
