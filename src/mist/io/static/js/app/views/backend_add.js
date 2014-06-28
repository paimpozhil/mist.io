define('app/views/backend_add', ['app/views/panel', 'ember'],
    //
    //  Add Backend View
    //
    //  @returns Class
    //
    function (PanelView) {

        'use strict';

        return PanelView.extend({


            //
            //
            //  Properties
            //
            //



            //
            //
            //  Initialization
            //
            //


            //
            //
            //  Methods
            //
            //


            updateAddButton: function() {
                if (Mist.backendsController.addingBackend || !Mist.backendAddController.formReady) {
                    $('#new-backend-ok').addClass('ui-state-disabled');
                } else {
                    $('#new-backend-ok').removeClass('ui-state-disabled');
                }
            },


            clear: function () {

                $('#gce-bundle').hide();
                $('#non-hp-cloud').hide();
                $('#docker-bundle').hide();
                $('#baremetal-bundle').hide();
                $('#openstack-bundle').hide();
                $('#new-backend-provider').collapsible('collapse');
                $('#new-backend-second-field').attr('type', 'password');
                $('#gce-bundle a').removeClass('ui-icon-check')
                    .addClass('ui-icon-carat-u');
                $('#common-bundle').show();
                Ember.run.next(function () {
                    $('#add-backend-panel').trigger('create');
                });
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                selectProvider: function (provider) {
                    $('#backend-add .provider-form').hide();
                    for (var p in Mist.backendAddController.providers) {
                        if (provider.provider.indexOf(p) > - 1) {
                            Mist.backendAddController.selectProvider(p);
                            $('#backend-add-provider').collapsible('collapse');
                            $('#backend-add-' + p).show();
                            break;
                        }
                    };
                    return;

                    if (provider.provider.indexOf('docker') > -1) {
                        this.set('firstFieldLabel', 'BasicAuth User (optional)');
                        this.set('secondFieldLabel', 'BasicAuth Password (optional)');
                        $('#common-bundle').hide();
                        $('#docker-bundle').show();
                        Mist.backendAddController.set('newBackendPort', 4243);
                    } else if (provider.provider.indexOf('openstack') > -1) {
                        this.set('firstFieldLabel', 'Username');
                        this.set('secondFieldLabel', 'Password');

                        //This is for HP Cloud specific
                        if (provider.provider.indexOf('region-') > -1) {
                            Mist.backendAddController.set('newBackendOpenStackURL', 'https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0/tokens');
                        } else {
                            $('#opentack-advanced-wrapper').show();
                        }
                        $('#openstack-bundle').show();

                    } else if (provider.provider.indexOf('bare_metal') > -1) {
                        this.set('firstFieldLabel', 'Hostname');
                        this.set('secondFieldLabel', 'User');
                        Mist.backendAddController.set('newBackendSecondField', 'root');
                        Mist.backendAddController.set('newBackendPort', 22);
                        Ember.run.next(function () {
                            $('#new-backend-key .ui-listview').listview('refresh');
                            $('#new-backend-second-field').attr('type', '');
                            $('#baremetal-bundle').show();
                        });
                    }
                },


                selectKey: function(key) {
                    $('#new-backend-key').collapsible('collapse');
                    Mist.backendAddController.set('newBackendKey', key);
                },


                privateKeyClicked: function () {
                    Mist.fileUploadController.open('Upload private key', 'Key',
                        function (uploadedFile) {

                            Mist.backendAddController.set('newBackendSecondField', uploadedFile);

                            if (uploadedFile) {
                                $('#gce-bundle a').addClass('ui-icon-check')
                                    .removeClass('ui-icon-carat-u');
                            } else {
                                $('#gce-bundle a').removeClass('ui-icon-check')
                                    .addClass('ui-icon-carat-u');
                            }
                        }
                    );
                },


                addKeyClicked: function() {
                    Mist.keyAddController.open( function (success, key) {
                        if (success) {
                            Mist.backendAddController.set('newBackendKey', key);
                            $('#new-backend-key').collapsible('collapse');
                            $('#new-backend-key .ui-listview').listview('refresh');
                        }
                    });
                },


                backClicked: function() {
                    Mist.backendAddController.close();
                },


                addClicked: function() {
                    Mist.backendAddController.add();
                },


                advancedToggled: function () {
                    var advanced = $('#non-hp-cloud');
                    if (advanced.css('display') == 'none') {
                        advanced.slideDown();
                    } else {
                        advanced.slideUp();
                    }
                }
            },


            //
            //
            //  Observers
            //
            //


            updateDoneButtonObserver: function() {
                Ember.run.once(this, 'updateAddButton');
            }.observes('Mist.backendsController.addingBackend', 'Mist.backendAddController.formReady'),
        });
    }
);
