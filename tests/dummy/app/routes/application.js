import Ember from 'ember';

export default Ember.Route.extend({

  activate: function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      Ember.$('.button-collapse').sideNav();
    });
  },

  actions: {
    willTransition: function() {
      if ( $('#js-nav-mobile-collapse').is(':visible') ) {
        Ember.$('#js-nav-mobile-collapse').click();
      }

      return true;
    },
  },

  renderTemplate: function() {

    // Render default outlet

    this.render();

    // render extra outlets

    this.render("navbar", {
      outlet: "navbar",
      into: "application" // important when using at root level
    });

    this.render("sidebar", {
      outlet: "sidebar",
      into: "application" // important when using at root level
    });

  },

});
