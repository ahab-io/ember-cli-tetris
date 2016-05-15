import Ember from 'ember';
import TetrisActionsMixin from 'ember-cli-tetris/mixins/tetris-actions';
import { module, test } from 'qunit';

module('Unit | Mixin | tetris actions');

// Replace this with your real tests.
test('it works', function(assert) {
  let TetrisActionsObject = Ember.Object.extend(TetrisActionsMixin);
  let subject = TetrisActionsObject.create();
  assert.ok(subject);
});
