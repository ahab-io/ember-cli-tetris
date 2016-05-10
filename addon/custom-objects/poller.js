import Ember from 'ember';

var Poller = Ember.Object.extend({

  _interval: 1000,
  _currentlyExecutedFunction: null,

  start: function(context, pollingFunction) {
    this.set('_currentlyExecutedFunction', this._schedule(context, pollingFunction, [].slice.call(arguments, 2)));
  },

  stop: function() {
    Ember.run.cancel(this.get('_currentlyExecutedFunction'));
  },

  _schedule: function(context, func, args) {
    return Ember.run.later(this, function() {
      this.set('_currentlyExecutedFunction', this._schedule(context, func, args));
      func.apply(context, args);
    }, this.get('_interval'));
  },

  setInterval: function(interval) {
    this.set('_interval', interval);
  }

});

export default Poller;
