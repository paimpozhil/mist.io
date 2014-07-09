define('app/controllers/backend_edit', ['ember'],
    //
    //  Backend Edit Controller
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            backend: null,
            callback: null,
            lockActions: true,
            newBackendTitle: null,


            //
            //
            //  Methods
            //
            //


            open: function(backend, callback) {
                this.clear();
                this.set('backend', backend);
                this.set('callback', callback);
                this.set('newBackendTitle', backend.title);
                this.view.open();
                this.unlock();
            },


            close: function() {
                this.lock();
                this.clear();
                this.view.close();
            },


            clear: function() {
                this.set('backend', null);
                this.set('callback', null);
                this.set('newBackendTitle', null);
            },


            lock: function () {
                Ember.run.next(this, function () {
                    this.set('lockActions', true);
                });
            },


            unlock: function () {
                Ember.run.next(this, function () {
                    this.set('lockActions', false);
                });
            },


            rename: function() {
                if (this.lockActions) return;
                if (!this.newBackendTitle) return;
                Mist.backendsController.renameBackend(this.backend.id, this.newBackendTitle, this.callback);
            },


            deleteBackend: function(callback) {
                if (this.lockActions) return;
                Mist.backendsController.deleteBackend(this.backend.id, callback);
            },


            toggleBackend: function(callback) {
                if (this.lockActions) return;
                var newState = $('#backend-toggle').val() == '1' ? true : false;
                Mist.backendsController.toggleBackend(this.backend.id, newState, callback);
            },


            //
            //
            //  Observers
            //
            //


            backendTitleOBserver: function() {
                Ember.run.once(this, 'rename');
            }.observes('newBackendTitle'),
        });
    }
);
