import Ember from 'ember';
import TetrisKeysMixin from 'ember-cli-tetris/mixins/tetris-keys';
import { module, test } from 'qunit';

module('Unit | Mixin | tetris keys');

// Replace this with your real tests.
test('it works', function(assert) {
  let TetrisKeysObject = Ember.Object.extend(TetrisKeysMixin);
  let subject = TetrisKeysObject.create();
  assert.ok(subject);
});
