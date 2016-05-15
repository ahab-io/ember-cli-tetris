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

  child: Ember.computed('model', 'model.rev', 'parent', 'parent.rev', 'modelType', 'isTopmostComponent', function() {
    var model = this.get('model');

    var isTopmostComponent = this.get('isTopmostComponent'),
        parent = this.get('parent');

    if ( model ) {
      if ( model.get('id') == null ) { throw 'Invalid tetris component child'; }
      console.log('child - ' + this.get('modelType'));
      if ( !parent && !isTopmostComponent ) debugger
      if ( !isTopmostComponent && parent.get('id') !== model.get(this.getParentAssociationName(this.get('modelType'))).get('id') ) debugger
      // if ( this.get('modelType') == 'player') debugger
      return model;
    }

    var isTopmostComponent = this.get('isTopmostComponent'),
        parent = this.get('parent');

    if ( isTopmostComponent ) {
      // if ( parent ) { throw 'Invalid topmost nested tetris component'; }

      var modelType = this.get('modelType'),
          component = this;

      model = this.get('store').createRecord(`tetris/${modelType}`);

      model.save().then(function(modelResponse) {
        component.set('model', modelResponse);
        // component.notifyPropertyChange('model');
      });
    } else {
      throw 'Invalid deeply nested tetris component';
    }

    return;
  }),

  grandChildren: Ember.computed('child', 'modelType', function() {
    var child = this.get('child'),
        associationName = this.getChildAssociationName();
    if ( !( child && associationName ) ) { console.log('aaaa');return; }

    var childType = this.get('modelType'),
        grandChildren = child.get(associationName);

    if ( this.isSimpleResource(childType) ) { console.log('bbbb');return grandChildren; }
    if ( this.get('makingGrandChild') ) { console.log('cccc');return; }

    if ( grandChildren.isFulfilled ) {
      var madeGrandChild = this.get('madeGrandChild');
      if ( !madeGrandChild ) { this.set('needsGrandChild', true); }
      console.log('grandchild - ' + associationName);
      return grandChildren;
    }

    var component = this;
    grandChildren.then(function(grandChildrenResponse) {
      console.log('notify 1 - ' + associationName)
      // component.set('grandChildren', grandChildrenResponse)
      // component.notifyPropertyChange('grandChildren');
      component.notifyPropertyChange('model');
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
        // if ( component.get('needsGrandChild') ) {
        //   component.get('needsGrandChild')
        // } else {

        // };
        // component.set('child', resolvedChild);
        console.log('notify 2 - ' + component.getChildAssociationName())
        // component.notifyPropertyChange('grandChildren');
        // component.notifyPropertyChange('child');
        // component.notifyPropertyChange('needsGrandChild');
      });

      return;
    }

    var associationName = this.getChildAssociationName(),
        grandChildModelType = singularize(associationName);
    if ( this.isSimpleResource(grandChildModelType) ) { return; }

    if ( this.get('makingGrandChild') ) { return; }
    this.set('makingGrandChild', true);

    var grandChildAttributes = {},
        modelType = this.get('modelType');

    grandChildAttributes[modelType] = child;
    var grandChild = this.get('store').createRecord(`tetris/${grandChildModelType}`, grandChildAttributes);

    console.log('*** ' + modelType + ": " + grandChild.get(modelType) + ' ***')

    grandChild.set(modelType, child);

    if ( this.isSingularResource(grandChildModelType) ) {
      child.set(associationName, grandChild);
    } else {
      child.get(associationName).then(function(grandChildren) {
        grandChildren.pushObject(grandChild);
      });
    }

    console.log('creating - ' + grandChildModelType)
    console.log('111')
    grandChild.save().then(function(grandChildResponse) {
      console.log('222 - ' + grandChildResponse)
      grandChildResponse.recursiveSave(function() {
        // debugger
        if ( component.get('isDestroying') ) { console.log('wuh wuh');return; }
        if ( component.get('isDestroyed') ) { console.log('bum bum');return; }

        component.setProperties({
          madeGrandChild: true,
          makingGrandChild: false,
          needsGrandChild: false
        });

        console.log('created - ' + grandChildModelType)
        // debugger
        console.log('notify 3')
        // component.notifyPropertyChange('child');
        component.notifyPropertyChange('model');
      });
      // component.saveRelationships(0, function() {
      //   debugger
      //   if ( component.get('isDestroying') ) { console.log('wuh wuh');return; }
      //   if ( component.get('isDestroyed') ) { console.log('bum bum');return; }

      //   component.setProperties({
      //     madeGrandChild: true,
      //     makingGrandChild: false,
      //     needsGrandChild: false
      //   });

      //   console.log('created - ' + grandChildModelType)
      //   debugger
      //   console.log('notify 3')
      //   component.notifyPropertyChange('child');
      // });
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

    ancestor.recursiveSave(callback);
    return;

    if ( !ancestor ) {
      if ( callback ) { callback(); }
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
