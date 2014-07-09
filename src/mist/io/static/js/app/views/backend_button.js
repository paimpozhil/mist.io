define('app/views/backend_button', ['ember'],
    //
    //  Backend Button View
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return Ember.View.extend({


            //
            //
            //  Properties
            //
            //


            tagName: 'a',
            backend: null,
            attributeBindings: ['data-role', 'data-icon'],
            template: Ember.Handlebars.compile('{{title}}'),


            //
            //
            //  Initialization
            //
            //


            load: function() {
                var btnElement = $('#'+this.elementId);
                if (btnElement.button) {
                    btnElement.button();
                    if ($('#backend-buttons').controlgroup) {
                        $('#backend-buttons').controlgroup('refresh');
                    }
                    this.stateObserver();
                } else {
                    Ember.run.later(this, this.load, 100);
                }
            }.on('didInsertElement'),


            unload: function() {
                Ember.run.next(function() {
                    if ($('#backend-buttons').controlgroup)
                        $('#backend-buttons').controlgroup('refresh');
                });
            }.on('willDestroyElement'),


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
                var parent = $('#' + this.elementId).parent()
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
