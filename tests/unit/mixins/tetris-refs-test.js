import Ember from 'ember';
import TetrisRefsMixin from 'ember-cli-tetris/mixins/tetris-refs';
import { module, test } from 'qunit';

module('Unit | Mixin | tetris refs');

// Replace this with your real tests.
test('it works', function(assert) {
  let TetrisRefsObject = Ember.Object.extend(TetrisRefsMixin);
  let subject = TetrisRefsObject.create();
  assert.ok(subject);
});
