/*exported Ember, DS */
import Ember from 'ember';
import DS from 'ember-data';

const { pluralize, singularize } = Ember.String;

export default Ember.Component.extend({

  classNames: ['cs-fill-container'],

  model: null,
  parent: null,

  modelType: null,
  isTopmostComponent: true,

  needsGrandChild: false,
  makingGrandChild: false,
  madeGrandChild: false,

  store: Ember.inject.service(),
  singularResources: ['board', 'grid'],
  tetrisHierarchy: ['game', 'player', 'board', 'grid', 'piece', 'block'],
  mostSimpleComplexResource: 'grid',

  onlyGrandChild: Ember.computed.alias('grandChildren'),

  setupTetrisComponent: Ember.on('init', function() {
    var modelType = Ember.inspect(this).match(/tetris-.*(?=::ember)/)[0].replace('tetris-', '');
    this.set('modelType', modelType);
    if ( this.isSimpleResource(modelType) ) { return; }

    var tetrisHierarchy = this.get('tetrisHierarchy'),
        curDepth = tetrisHierarchy.indexOf(modelType),
        tetrisModel;

    for (var i = 0; i < curDepth; i++) {
      tetrisModel = tetrisHierarchy[i];
      this.set( tetrisModel, this.computedAncestorFor(tetrisModel) );
    }
  }),

  isSimpleResource: function(modelType) {
    var tetrisHierarchy = this.get('tetrisHierarchy'),
        mostSimpleComplexResource = this.get('mostSimpleComplexResource'),
        curDepth = tetrisHierarchy.indexOf(modelType),
        lastComplexDepth = tetrisHierarchy.indexOf(mostSimpleComplexResource);

    return ( curDepth > lastComplexDepth );
  },

  computedAncestorFor: function(tetrisModel) {
    return Ember.computed('parent', 'modelType', function() {
      return this.getAncestor( tetrisModel,
        this.get('parent'), this.get('modelType')
      );
    });
  },

  child: Ember.computed('model', 'parent', 'modelType', 'isTopmostComponent', function() {
    var model = this.get('model');
    if ( model && model.get('id') == null ) { throw 'Invalid tetris component child'; }
    if ( model ) { return model; }

    var isTopmostComponent = this.get('isTopmostComponent'),
        parent = this.get('parent');

    if ( isTopmostComponent ) {
      if ( parent ) { throw 'Invalid nested tetris component'; }

      var modelType = this.get('modelType'),
          component = this;

      model = this.get('store').createRecord(`tetris/${modelType}`);

      model.save().then(function(modelResponse) {
        component.set('model', modelResponse);
        component.notifyPropertyChange('model');
      });
    }

    return;
  }),

  grandChildren: Ember.computed('child', 'modelType', function() {
    var child = this.get('child'),
        associationName = this.getChildAssociationName();
    if ( !( child && associationName ) ) { return; }

    var childType = this.get('modelType'),
        grandChildren = child.get(associationName);

    if ( this.isSimpleResource(childType) ) { return grandChildren; }
    if ( this.get('makingGrandChild') ) { return grandChildren; }

    if ( grandChildren.isFulfilled ) {
      var madeGrandChild = this.get('madeGrandChild');
      if ( !madeGrandChild ) { this.set('needsGrandChild', true); }
      return grandChildren;
    }

    var component = this;
    grandChildren.then(function() {
      component.notifyPropertyChange('child');
    });
    return;
  }),

  handleGrandChild: Ember.observer('needsGrandChild', function() {
    if ( !this.get('needsGrandChild') ) { return; }

    var child = this.get('child'),
        grandChildren = this.get('grandChildren');

    if ( !child || !grandChildren ) { return; }
    if ( child.get('id') == null ) { return; }

    if ( grandChildren.get('length') > 0 ) { return; }
    if ( grandChildren.get('id') ) { return; }

    var component = this;
    if ( !child.save ) {
      child.then(function(resolvedChild) {
        component.set('child', resolvedChild);
        component.notifyPropertyChange('child');
        component.notifyPropertyChange('needsGrandChild');
      });

      return;
    }

    var associationName = this.getChildAssociationName(),
        grandChildModelType = singularize(associationName);
    if ( this.isSimpleResource(grandChildModelType) ) { return; }

    if ( this.get('makingGrandChild') ) { return; }
    this.set('makingGrandChild', true);

    var grandChildAttributes = {};
    grandChildAttributes[associationName] = child;
    var grandChild = this.get('store').createRecord(`tetris/${grandChildModelType}`, grandChildAttributes);

    if ( this.isSingularResource(grandChildModelType) ) {
      child.set(associationName, grandChild);
    } else {
      child.get(associationName).then(function(grandChildren) {
        grandChildren.pushObject(grandChild);
      });
    }

    grandChild.save().then(function() {
      component.saveRelationships(0, function() {
        component.setProperties({
          madeGrandChild: true,
          makingGrandChild: false,
          needsGrandChild: false
        });

        component.notifyPropertyChange('child');
      });
    });

  }),

  saveRelationships: function(depth, callback) {
    var modelType = this.get('modelType'),
        ancestorClass = this.getAssociationNameForDepth(modelType, depth),
        ancestor;

    if ( modelType === ancestorClass ) {
      ancestor = this.get('child');
    } else if ( ancestorClass ) {
      var parent = this.get('parent');
      ancestor = this.getAncestor(ancestorClass, parent, modelType);
    }

    if ( !ancestor ) {
      callback();
      return;
    }

    var component = this;
    if ( !ancestor.save ) {
      ancestor.then(function(resolvedAncestor) {
        resolvedAncestor.save().then(function() {
          component.saveRelationships(depth-1, callback);
        });
      });

      return;
    }

    ancestor.save().then(function() {
      component.saveRelationships(depth-1, callback);
    });

  },

  getAncestor: function(ancestorClass, parent, currentClass) {
    if ( !parent ) { return; }
    var parentClass = this.getParentAssociationName(currentClass);

    if ( parentClass === ancestorClass ) { return parent; }
    var grandParentAssociationName = this.getParentAssociationName(parentClass);

    var grandParent = parent.get(grandParentAssociationName);
    return this.getAncestor(ancestorClass, grandParent, parentClass);
  },

  getChildAssociationName: function(modelType) {
    var associationName = this.getAssociationNameForDepth(modelType, +1);

    if ( this.isSingularResource(associationName) ) { return associationName; }
    return pluralize(associationName);
  },

  getParentAssociationName: function(modelType) {
    var associationName = this.getAssociationNameForDepth(modelType, -1);

    return associationName;
  },

  getAssociationNameForDepth: function(modelType, depth) {
    modelType = modelType || this.get('modelType');
    var associationType = this.getAssociationTypeForDepth(modelType, depth);
    return associationType;
  },

  getAssociationTypeForDepth: function(modelType, depth) {
    var curDepth = this.get('tetrisHierarchy').indexOf(modelType);
    if ( curDepth < 0 ) { return; }

    var newDepth = curDepth + depth,
        newType = this.get('tetrisHierarchy')[newDepth];

    return newType;
  },

  isSingularResource: function(modelType) {
    var isSingularResource = (
      Ember.$.inArray(modelType, this.get('singularResources')) >= 0
    );

    return isSingularResource;
  }

});
