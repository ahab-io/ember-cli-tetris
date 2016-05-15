/*global DS */

import TetrisModel from '../tetris-model';

export default TetrisModel.extend({
  parent: Ember.computed.alias('player'),
  player: DS.belongsTo('tetris/player'),
  grid: DS.belongsTo('tetris/grid')
});
