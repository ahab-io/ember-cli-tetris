import Ember from 'ember';
import DS from 'ember-data';

const { pluralize } = Ember.String;

export default Ember.Component.extend({

  model: null,
  parent: null,

  store: Ember.inject.service(),

  child: Ember.computed('model', 'parent', function() {
    var model, parent, modelType, associationName;

    model = this.get('model');
    if ( model ) { return model; }

    parent = this.get('parent');
    if ( !parent ) { throw 'Invalid tetris component (parent error)'; }

    modelType = this.getModelType();
    model = this.get('store').createRecord(modelType);
    associationName = this.getAssociationName(model, modelType);

    this.set('model', model);
    parent.get(associationName).pushObject(model);
  }),

  getModelType: function() {
    return Ember.inspect(this).match(/tetris-.*(?=::ember)/)[0].replace('-', '/');
  },

  getAssociationName: function(model, modelType) {
    var associationName = modelType.replace('tetris/', '');
    if ( !model.get('isSingular') ) {
      associationName = pluralize(associationName);
    }
    return associationName;
  },

});
