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


            load: function () {
                this.setupProviders();
            }.on('init'),


            //
            //
            //  Methods
            //
            //


            open: function (callback) {
                this._clear();
                this._updateFormReady();
                this.set('callback', callback);
                this.view.open();
            },


            close: function () {
                this.view.close();
                this._clear();
            },


            add: function () {
                var that = this;
                var projectName = this.newBackendOpenStackTenant || this.newBackendProjectName;
                Mist.backendsController.addBackend(
                    this.newBackendProvider.title,
                    this.newBackendProvider.provider,
                    this.newBackendFirstField,
                    this.newBackendSecondField,
                    this.newBackendOpenStackURL,
                    this.newBackendOpenStackRegion,
                    projectName,
                    this.newBackendOpenStackComputeEndpoint,
                    this.newBackendDockerURL,
                    this.newBackendPort,
                    this.newBackendKey.id,
                    function (success, backend) {
                        that._giveCallback(success, backend);
                        if (success) {
                            that.close();
                        }
                    }
                );
            },


            setupProviders: function () {
                for (var provider in this.providers) {
                    provider = this.providers[provider];
                    var keys = Object.keys(provider).filter(function (item) {
                        return ! (provider[item] instanceof Function);
                    });
                    if (!(provider.clear instanceof Function))
                        addClearFunction(provider, keys);
                }
                function addClearFunction(provider, fields) {
                    provider.clear = function () {
                        fields.forEach(function (field) {
                            provider.set(field, null);
                        });
                    };
                };
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {

                this.set('callback', null)
                    .set('newBackendPort', null)
                    .set('newBackendFirstField', null)
                    .set('newBackendSecondField', null)
                    .set('newBackendOpenStackURL', null)
                    .set('newBackendOpenStackRegion', null)
                    .set('newBackendOpenStackTenant', null)
                    .set('newBackendOpenStackComputeEndpoint', null)
                    .set('newBackendDockerURL', null)
                    .set('newBackendKey', {id: 'Select SSH Key'})
                    .set('newBackendProvider', {title: 'Select provider'});
            },


            _updateFormReady: function () {
                var ready = false;
                if ('provider' in this.newBackendProvider) { // Filters out the "Select provider" dummy provider

                    if (this.newBackendProvider.provider == 'docker') {

                        if (this.newBackendDockerURL && this.newBackendPort) {
                            ready = true;
                        }

                    } else if (this.newBackendFirstField && this.newBackendSecondField) {

                        ready = true;

                        if (this.newBackendProvider.provider == 'openstack') { // Pure Openstack
                            if (!this.newBackendOpenStackURL) {
                                ready = false;
                            }
                        } else if (this.newBackendProvider.provider.indexOf('openstack') > -1) { // HpCloud
                            if (!(this.newBackendOpenStackURL && this.newBackendOpenStackTenant)) {
                                ready = false;
                            }
                        } else if (this.newBackendProvider.provider == 'bare_metal') { // Baremetal
                            if (!Mist.keysController.keyExists(this.newBackendKey.id)) {
                                ready = false;
                            }
                        } else if (this.newBackendProvider.provider == 'gce') { // Google Compute Engine
                            if (!this.newBackendProjectName) {
                                ready = false;
                            }
                        }
                    }
                }
                this.set('formReady', ready);
            },


            _giveCallback: function (success, backend) {
                if (this.callback) this.callback(success, backend);
            },


            //
            //
            //  Observers
            //
            //


            formObserver: function () {
                Ember.run.once(this, '_updateFormReady');
            },


            //
            //
            //  Providers
            //
            //


            providers: {

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

                openstack: Ember.Object.create({
                    authURL: null,
                    username: null,
                    password: null,
                    tenantName: null,

                    opt_region: null,
                    opt_computeEndpoint: null,
                }),

                bare_metal: Ember.Object.create({
                    key: null,
                    host: null,
                    port: null,
                    user: null,
                    password: null,
                })
            }
        });
    }
);
