import Model from 'ember-data/model';

export default Model.extend({
  isSingular: DS.attr('boolean', { defaultValue: false }),
});
