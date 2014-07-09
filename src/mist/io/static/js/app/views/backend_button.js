define('app/views/backend_button', ['app/views/templated', 'ember'],
    //
    //  Backend Button View
    //
    //  @returns Class
    //
    function(TemplatedView) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            backend: null,


            //
            //
            //  Initialization
            //
            //


            load: function() {
                Ember.run.next(this, function () {
                   this.stateObserver();
                   this.refreshControlGroup();
                });
            }.on('didInsertElement'),


            unload: function() {
                Ember.run.next(this.refreshControlGroup);
            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            refreshControlGroup: function () {
                if ($('#backend-buttons').controlgroup)
                    $('#backend-buttons').controlgroup('refresh');
            },


            //
            //
            //  Actions
            //
            //


            click: function() {
                $(Mist.backendEditController.view.popupId).popup(
                    'option', 'positionTo', '#' + this.elementId);
                Mist.backendEditController.open(this.backend);
            },


            //
            //
            //  Observers
            //
            //


            stateObserver: function() {
                var parent = $('#' + this.elementId);
                parent.removeClass(
                    'ui-icon-check ui-icon-offline ui-icon-waiting');
                if (this.backend.state == 'online')
                    parent.addClass('ui-icon-check');
                else if (this.backend.state == 'offline')
                    parent.addClass('ui-icon-offline');
                else if (this.backend.state == 'waiting')
                    parent.addClass('ui-icon-waiting');
            }.observes('backend.state')
        });
    }
);
