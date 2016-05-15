/*global DS */

import TetrisModel from '../tetris-model';

export default TetrisModel.extend({
  parent: null,
  players: DS.hasMany('tetris/player'),
  isLive: DS.attr('boolean', {defaultValue: true})
});
