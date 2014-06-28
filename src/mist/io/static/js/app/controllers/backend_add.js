define('app/controllers/backend_add', ['app/models/backend', 'ember'],
    //
    //  Backend Add Controller
    //
    //  @returns Class
    //
    function (Backend) {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            view: null,
            callback: null,
            formReady: null,
            selectedProvider: null,


            load: function () {
                this.setupProviders();
            }.on('init'),


            //
            //
            //  Methods
            //
            //


            open: function (callback) {
                this.set('callback', callback);
                this.view.open();
            },


            close: function () {
                this.view.close();
            },


            add: function () {
                var that = this;
                Mist.backendsController.addBackend(
                    function (success, backend) {
                        that._giveCallback(success, backend);
                        if (success) {
                            that.close();
                        }
                    }
                );
            },


            setupProviders: function () {
                var that = this;
                Object.keys(this.providers).forEach(function (provider) {
                    provider = that.providers[provider];
                    var keys = Object.keys(provider).filter(function (item) {
                        return ! (provider[item] instanceof Function);
                    });
                    if (!(provider.clear instanceof Function))
                        addClearFunction(provider, keys);
                    if (!(provider.select instanceof Function))
                        addSelectFunction(provider, keys);
                    if (!(provider.unselect instanceof Function))
                        addUnselectFunction(provider, keys);
                    if (!(provider.updateReady instanceof Function))
                        addUpdateReadyFunction(provider, keys);
                });
                var that = this;
                function addClearFunction(provider, fields) {
                    provider.clear = function () {
                        fields.forEach(function (field) {
                            provider.set(field, null);
                        });
                    };
                };
                function addSelectFunction(provider, fields) {
                    provider.select = function () {
                        provider.clear();
                        that.set('selectedProvider', provider);
                        fields.forEach(function (field) {
                            if (field.indexOf('opt_') != 0)
                                provider.addObserver(field, provider, 'updateReady');
                        });
                        provider.updateReady();
                    }
                };
                function addUnselectFunction(provider, fields) {
                    provider.unselect = function () {
                        fields.forEach(function (field) {
                            if (field.indexOf('opt_') != 0) {
                                provider.removeObserver(field, provider, 'updateReady');
                            }
                        });
                        provider.clear();
                        that.set('selectedProvider', null);
                    }
                };
                function addUpdateReadyFunction(provider, fields) {
                    provider.updateReady = function () {
                        var ready = true;
                        fields.forEach(function (field) {
                            if (field.indexOf('opt_') != 0)
                                if (!provider[field]) ready = false;
                        });
                        that.set('formReady', ready);
                    }
                };
            },


            selectProvider: function (provider) {
                if (this.selectedProvider)
                    this.selectedProvider.unselect();
                this.providers[provider].select();
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _giveCallback: function (success, backend) {
                if (this.callback) this.callback(success, backend);
            },


            //
            //
            //  Providers
            //
            //


            providers: Ember.Object.create({

                ec2: Ember.Object.create({
                    apiKey: null,
                    apiSecret: null,
                }),

                linode: Ember.Object.create({
                    apiKey: null,
                    username: null,
                }),

                softlayer: Ember.Object.create({
                    apiKey: null,
                    apiSecret: null,
                }),

                rackspace: Ember.Object.create({
                    apiKey: null,
                    username: null,
                }),

                nephoscale: Ember.Object.create({
                    username: null,
                    password: null,
                }),

                digitalocean: Ember.Object.create({
                    apiKey: null,
                    clientId: null,
                }),

                gce: Ember.Object.create({
                    key: null,
                    email: null,
                    projectId: null,
                }),

                docker: Ember.Object.create({
                    host: null,
                    port: null,
                    user: null,
                    password: null,
                }),

                bare_metal: Ember.Object.create({
                    key: null,
                    host: null,
                    port: null,
                    user: null,
                    password: null,
                }),

                openstack: Ember.Object.create({
                    authURL: null,
                    username: null,
                    password: null,
                    tenantName: null,
                    opt_region: null,
                    opt_computeEndpoint: null,
                })
            })
        });
    }
);
