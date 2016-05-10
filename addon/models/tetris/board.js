/*global DS */

import TetrisModel from '../tetris-model';

export default TetrisModel.extend({
  player: DS.belongsTo('tetris/player'),
  grid: DS.belongsTo('tetris/grid')
});
