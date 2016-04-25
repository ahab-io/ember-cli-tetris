import TetrisModel from '../tetris-model';

export default TetrisModel.extend({
  isSingular: DS.attr('boolean', { defaultValue: true }),
});
