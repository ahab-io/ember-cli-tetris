/*exported Ember, DS */

import Ember from 'ember';
import Model from 'ember-data/model';
import DS from 'ember-data';

export default Model.extend({
  rev: DS.attr('string') // for ember-pouch
});
