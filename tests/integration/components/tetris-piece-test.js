import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tetris-piece', 'Integration | Component | tetris piece', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{tetris-piece}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#tetris-piece}}
      template block text
    {{/tetris-piece}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
