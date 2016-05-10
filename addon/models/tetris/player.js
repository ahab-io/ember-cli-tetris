/*global DS */

import TetrisModel from '../tetris-model';

export default TetrisModel.extend({
  game: DS.belongsTo('tetris/game'),
  board: DS.belongsTo('tetris/board')
});
