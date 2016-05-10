import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {

  level: null,
  score: null,
  lines: null,

  init() {
    this._super(...arguments);

    this.setProperties({
      level: 1,
      score: 0,
      lines: 0
    });

    this.on('softDrop', this.softDrop);
    this.on('hardDrop', this.hardDrop);
    this.on('lineClear', this.lineClear);
  },

  lineClear: function(linesCleared) {
    var level = this.get('level'),
        score = this.get('score'),
        lines = this.get('lines'),
        points;

    switch( linesCleared ) {
      case 1:
        points = 100;
        break;
      case 2:
        points = 300;
        break;
      case 3:
        points = 500;
        break;
      case 4:
        points = 800;
        break;
      default:
        throw 'Invalid tetris line clears';
    }

    points *= level;
    score += points;
    lines += linesCleared;

    var nextLevelLines = ( 10 * level );
    nextLevelLines += ( 0.5 * level * (level-1) );
    if ( lines >= nextLevelLines ) { level++; }

    this.setProperties({
      level: level,
      score: score,
      lines: lines
    });
  },

  softDrop: function() {
    var score = this.get('score');
    score++;
    this.set('score', score);
  },

  hardDrop: function(dropHeight) {
    var score = this.get('score');
    score += ( 2 * dropHeight );
    this.set('score', score);
  }

});
