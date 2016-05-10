/*global DS */

import TetrisModel from '../tetris-model';

export default TetrisModel.extend({
  board: DS.belongsTo('tetris/board'),
  pieces: DS.hasMany('tetris/piece'),
  numRows: DS.attr('number', {defaultValue: 20}),
  numCols: DS.attr('number', {defaultValue: 10}),
  extraTopRows: DS.attr('number', {defaultValue: 2}),
  extraBotRows: DS.attr('number', {defaultValue: 3})
});
