/*global Ember */
import layout from '../templates/components/tetris-block';
import TetrisComponent from './tetris-component';

export default TetrisComponent.extend({
  layout,

  willDestroyElement() {
    this._super(...arguments);

    var prevI = this.get('prevI'),
        prevJ = this.get('prevJ');

    if ( typeof prevI === 'undefined' ) { return; }
    if ( typeof prevJ === 'undefined' ) { return; }
    this.exitOldCell(prevI, prevJ);
  },

  prevI: null,
  prevJ: null,

  tetrominoCatalog: Ember.inject.service(),

  coords: Ember.computed.alias('child.coords'),

  color: Ember.computed.alias('parent.color'),
  allColors: Ember.computed.alias('tetrominoCatalog.colors'),

  shade: Ember.computed.alias('parent.shade'),
  allShades: Ember.computed.alias('tetrominoCatalog.shades'),

  updatePosition: Ember.on('init', Ember.observer('coords', 'color', 'allColors', 'shade', 'allShades', function() {
    var coords = this.get('coords'),
        posI = coords[0],
        posJ = coords[1];
    if ( typeof posI === 'undefined' ) { return; }
    if ( typeof posJ === 'undefined' ) { return; }

    var prevI = this.get('prevI'),
        prevJ = this.get('prevJ');
    if ( posI === prevI && posJ === prevJ ) { return; }

    this.exitOldCell(prevI, prevJ);
    this.enterNewCell(posI, posJ);

    this.set('prevI', posI);
    this.set('prevJ', posJ);
  })),

  exitOldCell: function(prevI, prevJ) {
    var oldCell = Ember.$(`.cs-tetris-grid__row__${prevI} .cs-tetris-grid__col__${prevJ}`);

    var fill = 'cs-tetris-grid__block',
        color = this.get('color'),
        shade = this.get('shade');

    var safetyFill = 'js-tetris-grid__block__stays-filled',
        safetyColor = 'js-tetris-grid__block__stays-same-color',
        safetyShade = 'js-tetris-grid__block__stays-same-shade';

    this.safelyRemoveFromCell(oldCell, fill, safetyFill);
    this.safelyRemoveFromCell(oldCell, color, safetyColor);
    this.safelyRemoveFromCell(oldCell, shade, safetyShade);
  },

  enterNewCell: function (posI, posJ) {
    var newCell = Ember.$(`.cs-tetris-grid__row__${posI} .cs-tetris-grid__col__${posJ}`);

    var fill = 'cs-tetris-grid__block',
        color = this.get('color'),
        shade = this.get('shade');

    newCell.addClass(fill);
    newCell.addClass(color);
    newCell.addClass(shade);
  },

  safelyRemoveFromCell: function(oldCell, cellClass, safetyClass) {
    if ( oldCell.hasClass(safetyClass) ) {
      oldCell.removeClass(safetyClass);
    } else {
      oldCell.removeClass(cellClass);
    }
  }

});
