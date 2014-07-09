define('app/views/backend_edit', ['app/views/popup', 'ember'],
    //
    //  Backend Edit View
    //
    //  @returns Class
    //
    function(PopupView) {

        'use strict';

        return PopupView.extend({


            //
            //
            //  Methods
            //
            //


            open: function () {
                this._super();
                $('#monitoring-message').hide();
                $('#backend-delete-confirm').hide();
                $('#backend-toggle option[value=1]')[0].selected =
                    Mist.backendEditController.backend.enabled;
                $('#backend-toggle').slider('refresh');
            },


            close: function () {
                this._super();
            },


            updateEnabledState: function() {
                if ($('#backend-toggle').slider) {
                    if (Mist.backendEditController.backend) {
                        var currentValue = $('#backend-toggle').val();
                        var newValue = Mist.backendEditController.backend.enabled ? '1' : '0';
                        if (currentValue != newValue) {
                            $('#backend-toggle').val(newValue).slider('refresh');
                        }
                    }
                }
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                stateToggleSwitched: function() {
                    Mist.backendEditController.toggleBackend();
                },


                deleteClicked: function(){
                    if (Mist.backendEditController.backend.getMonitoredMachines.length) {
                        $('#monitoring-message').show();
                    } else {
                        $('#monitoring-message').hide();
                    }
                    $('#backend-delete-confirm').slideDown();
                },


                backClicked: function() {
                    Mist.backendEditController.close();
                },


                yesClicked: function() {
                    $('#button-confirm-disable').addClass('ui-state-disabled');
                    Mist.backendEditController.deleteBackend(function(success) {
                        if (success) {
                            $('#edit-backend-popup').popup('close');
                            $('#backend-delete-confirm').slideUp();
                        }
                        $('#button-confirm-disable').removeClass('ui-state-disabled');
                    });
                },


                noClicked: function() {
                    $('#backend-delete-confirm').slideUp();
                }
            },


            //
            //
            //  Observers
            //
            //


            stateObserver: function() {
                Ember.run.once(this, 'updateEnabledState');
            }.observes(
                'Mist.backendsController.togglingBackend',
                'Mist.backendEditController.backend.state'),
        });
    }
);
