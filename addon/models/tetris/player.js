/*global DS */

import TetrisModel from '../tetris-model';

export default TetrisModel.extend({
  parent: Ember.computed.alias('game'),
  game: DS.belongsTo('tetris/game'),
  board: DS.belongsTo('tetris/board')
});
