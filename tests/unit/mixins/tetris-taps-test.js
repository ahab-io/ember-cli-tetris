import Ember from 'ember';
import TetrisTapsMixin from 'ember-cli-tetris/mixins/tetris-taps';
import { module, test } from 'qunit';

module('Unit | Mixin | tetris taps');

// Replace this with your real tests.
test('it works', function(assert) {
  let TetrisTapsObject = Ember.Object.extend(TetrisTapsMixin);
  let subject = TetrisTapsObject.create();
  assert.ok(subject);
});
