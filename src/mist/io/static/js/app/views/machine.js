define('app/views/machine', ['app/views/mistscreen'],
    //
    //  Machine View
    //
    //  @returns Class
    //
    function(MistScreen) {

        'use strict';

        return MistScreen.extend({


            //
            //
            //  Properties
            //
            //


            rules: [],
            metrics: [],
            machine: null,


            //
            //
            //  Initialization
            //
            //

            load: function() {

                // Add Event listeners
                Mist.backendsController.on('onMachineListChange', this, 'load');
                Mist.metricsController.on('onMetricListChange', this, 'updateMetrics');

                Ember.run(this, function() {
                    this.updateCurrentMachine();
                    if (this.machine.id) {
                        this.updateUptime();
                        this.updateFooter();
                        this.updateMetrics();
                    }
                });
            }.on('didInsertElement'),


            unload: function() {

                // Remove event listeners
                Mist.backendsController.off('onMachineListChange', this, 'load');
                Mist.metricsController.off('onMetricListChange', this, 'updateMetrics');

                this.stopPolling();

            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            updateCurrentMachine: function() {
                Ember.run(this, function() {
                    var machine = Mist.backendsController.getRequestedMachine();
                    if (machine)
                        this.get('controller').set('model', machine);

                    this.set('machine', this.get('controller').get('model'));
                    if (this.machine.id)
                        this.machine.set('keysCount',
                            Mist.keysController.getMachineKeysCount(this.machine)
                        );
                });
            },


            updateFooter: function() {

                if (this.machine.can_tag)
                    $('#single-machine-tags-btn').removeClass('ui-state-disabled');
                else
                    $('#single-machine-tags-btn').addClass('ui-state-disabled');

                if (Mist.keysController.getMachineKeysCount(this.machine) && this.machine.state == 'running')
                    $('#single-machine-shell-btn').removeClass('ui-state-disabled');
                else
                    $('#single-machine-shell-btn').addClass('ui-state-disabled');

                if (this.machine.id)
                    $('#single-machine-power-btn').removeClass('ui-state-disabled');
                else
                    $('#single-machine-power-btn').addClass('ui-state-disabled');
            },


            updateKeysButton: function() {
                if (this.machine.state == 'running')
                    $('#mist-manage-keys').removeClass('ui-state-disabled');
                else
                    $('#mist-manage-keys').addClass('ui-state-disabled');
            },


            updateEnableButton: function() {
                Ember.run.next(this, function() {
                    if (this.machine.id && this.machine.state == 'running') {
                        $('#enable-monitor-btn').removeClass('ui-state-disabled');
                    } else {
                        $('#enable-monitor-btn').addClass('ui-state-disabled');
                    }
                });
            },


            updateMonitoringCollapsible: function() {
                Ember.run.next(this, function() {
                    if (Mist.backendsController.checkedMonitoring && this.machine.id) {
                        $('#monitoring-collapsible').show();
                    } else {
                        $('#monitoring-collapsible').hide();
                    }
                });
            },


            updateChangeMonitoringButton: function() {

                Ember.run.next(this, function() {
                    $('#enable-monitor-btn').addClass('ui-state-disabled');
                    if (this.machine.disablingMonitoring) {
                        $('#disable-monitor-btn').addClass('ui-state-disabled');
                    } else if (!this.machine.pendingMonitoring) {
                        $('#disable-monitor-btn').removeClass('ui-state-disabled');
                        if (!this.machine.enablingMonitoring)
                            $('#enable-monitor-btn').removeClass('ui-state-disabled');
                    }
                });
            },

            rulesObserver: function(){
                var rules = [];
                var machine = this.machine;

                if (!machine.equals)
                    return;

                Mist.rulesController.content.forEach(function(rule) {
                    if (machine.equals(rule.machine))
                        rules.push(rule);
                });
                this.set('rules', rules);
            }.observes('Mist.rulesController.@each', 'Mist.rulesController.@each.machine', 'machine'),


            updateMetrics: function () {

                var metrics = [];
                var machine = this.machine;

                if (!machine.id)
                    return;

                Mist.metricsController.customMetrics.forEach(function(metric) {
                    metric.machines.forEach(function(metricMachine) {
                        if (machine.equals(metricMachine))
                            metrics.push(metric);
                    });
                });
                Mist.metricsController.builtInMetrics.forEach(function(metric) {
                    metrics.push(metric);
                });

                this.set('metrics', metrics);

                Ember.run.next(function () {
                    if ($('#metrics-container').listview)
                        $('#metrics-container').listview()
                            .listview('refresh');
                });
            },


            stopPolling: function() {
                // if it polls for stats, stop it
                if ('context' in Mist)
                    Mist.context.stop();
            }.observes('controller.model.hasMonitoring'),


            updateUptime: function() {
                if ($('#single-machine-page').length) {

                    // Rescedule updateUptime
                    Ember.run.later(this, function() {
                        this.updateUptime();
                    }, 1000);

                    // Calculate uptime
                    var machine = this.machine;
                    if (!machine) return 0;
                    if (!machine.uptimeChecked) return 0;
                    if (!machine.uptimeFromServer) return 0;
                    machine.set('uptime', machine.uptimeFromServer + (Date.now() - machine.uptimeChecked));
                }
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                manageKeysClicked: function() {
                    Mist.machineKeysController.open(this.machine);
                },


                addKeyClicked: function() {
                    Mist.machineKeysController.openKeyList(this.machine);
                },


                tagsClicked: function () {
                    Mist.machineTagsController.open(this.machine);
                },


                powerClicked: function () {
                    Mist.machinePowerController.open(this.machine);
                },


                shellClicked: function () {
                    Mist.machineShellController.open(this.machine);
                },


                addMetricClicked: function () {
                    Mist.metricAddController.open(this.machine);
                },


                deleteMetric: function (metric) {
                    Mist.metricsController.deleteMetric(metric);
                },


                enableMonitoringClicked: function () {

                    if (Mist.authenticated) {
                        if (Mist.current_plan) {
                            if (this.machine.probed) {
                                var machine = this.machine;
                                Mist.confirmationController.set('title', 'Enable monitoring');
                                Mist.confirmationController.set('text', 'Are you sure you want to enable monitoring for this machine?');
                                Mist.confirmationController.set('callback', function () {
                                    Mist.monitoringController.changeMonitoring(machine);
                                });
                                Mist.confirmationController.show();
                            } else {
                                Mist.machineManualMonitoringController.open(this.machine);
                            }
                        } else {
                            Mist.notificationController.set('msgHeader', 'No plan');
                            Mist.notificationController.set('msgPart1', 'In order to use our monitoring service' +
                                                                        ' you have to purchase a plan');
                            Mist.notificationController.set('msgPart2', 'You can do that in the Account page, which can ' +
                                                                        'be accessed from the menu button on the top right corner');
                            Mist.notificationController.showMessagebox();
                        }
                    } else {
                        Mist.loginController.open();
                    }
                },


                disableMonitoringClicked: function() {
                    var machine = this.machine;
                    Mist.confirmationController.set('title', 'Disable monitoring');
                    Mist.confirmationController.set('text', 'Are you sure you want to disable monitoring for this machine?');
                    Mist.confirmationController.set('callback', function () {
                        Mist.monitoringController.changeMonitoring(machine);
                    });
                    Mist.confirmationController.show();
                },


                addRuleClicked: function() {
                    var operator = {'title': 'gt', 'symbol': '>'};
                    Mist.rulesController.newRule(
                        this.machine,
                        Mist.metricsController.getMetric('load.shortterm'),
                        operator,
                        5,
                        'alert'
                    );
                },


                probeClicked: function() {
                    this.machine.probe(null, function(success) {
                        if (!success)
                            Mist.notificationController.notify('Failed to probe machine');
                    });
                },


                closeManualMonitoringPopup: function() {
                    $('#manual-monitoring-popup').popup('close');
                }
            },


            //
            //
            //  Computed Properties
            //
            //


            providerIconClass: function() {
                if (!this.machine || !this.machine.backend || !this.machine.backend.provider)
                    return '';
                return 'provider-' + this.machine.backend.getSimpleProvider();
            }.property('machine', 'machine.backend.provider'),


            imageIconClass: function () {

                if (!this.machine || !this.machine.extra ||
                    !this.machine.backend || !this.machine.backend.provider)
                    return 'image-generic';

                var imageId = this.machine.extra.image_id || this.machine.extra.imageId || '';

                // Use .toString() because digital ocean returns
                // an number instead of a string which breaks the search
                return 'image-' + this.machine.backend.images.getImageOS(imageId.toString());

            }.property('machine', 'machine.extra', 'machine.extra.@each'),


            upFor: function() {
                var ret = '';
                if (this.machine && this.machine.uptime) {
                    var x = Math.floor(this.machine.uptime / 1000);
                    var seconds = x % 60;
                    x = Math.floor(x / 60);
                    var minutes = x % 60;
                    x = Math.floor(x / 60);
                    var hours = x % 24;
                    x = Math.floor(x / 24);
                    var days = x;

                    if (days) ret = ret + days + ' days, ';
                    if (hours) ret = ret + hours + ' hours, ';
                    if (minutes) ret = ret + minutes + ' minutes, ';
                    if (seconds) {
                        ret = ret + seconds + ' seconds';
                    } else {
                        ret = ret + '0 seconds';
                    }
                }
                return ret;
            }.property('machine.uptime'),


            lastProbe: function(){
                var ret = 'never';
                if (this.machine && this.machine.uptimeChecked > 0) {
                    var x = (Date.now()-this.machine.uptimeChecked) / 1000;
                    var minutes = Math.floor(x / 60);
                    if (minutes > 1)
                        ret = minutes + ' minutes ago';
                    else if (minutes == 1)
                        ret = "1 minute ago";
                    else
                        ret = "just now";
                }
                return ret;
            }.property('machine.uptime'),


            basicInfo: function() {
                if (!this.machine) return;

                var basicInfo = {};

                if (this.machine.public_ips instanceof Array) {
                    this.set('public_ips', this.machine.public_ips);
                } else if (typeof this.machine.public_ips == 'string') {
                    this.set('public_ips', [this.machine.public_ips]);
                }

                if (this.machine.backend.provider != 'docker') {
                    if (this.machine.private_ips instanceof Array) {
                        this.set('private_ips', this.machine.private_ips);
                    } else if (typeof this.machine.public_ips == 'string') {
                        this.set('private_ips', [this.machine.private_ips]);
                    }
                }
                if (this.machine.extra) {
                    if (this.machine.backend.provider == 'docker') {
                        basicInfo['Image'] = this.machine.extra.image;
                        basicInfo['Status'] = this.machine.extra.status;
                        basicInfo['Command'] = this.machine.extra.command;
                    }
                    if (this.machine.extra.dns_name) {
                        basicInfo['DNS Name'] = this.machine.extra.dns_name;
                    }
                    if (this.machine.extra.launchdatetime) {
                        basicInfo['Launch Date'] = this.machine.extra.launchdatetime;
                    }
                }
                if (this.machine.image && this.machine.image.name) {
                    basicInfo.image = this.machine.image.name;
                }

                var ret = [];
                for (var item in basicInfo) {
                    if (typeof basicInfo[item] == 'string') {
                        ret.push({key:item, value: basicInfo[item]});
                    }
                }
                return ret;
            }.property('machine', 'machine.public_ips', 'machine.private_ips'),


            metadata: function() {
                if (!this.machine || !this.machine.extra) return;
                var ret = [];

                for (var item in this.machine.extra) {
                    var value = this.machine.extra[item];
                    if (typeof value == 'string' || typeof value == 'number') {
                        ret.push({key:item, value: value});
                    }
                }

                Ember.run.next(function() {
                    if ($('#single-machine-metadata').collapsible) {
                        $('#single-machine-metadata').collapsible();
                    }
                });
                return ret;

            }.property('machine', 'machine.extra'),

            //
            //
            //  Observers
            //
            //

            modelObserver: function() {
                Ember.run.once(this, 'load');
                Ember.run.once(this, 'updateEnableButton');
            }.observes('controller.model'),


            footerObserver: function() {
                Ember.run.once(this, 'updateFooter');
            }.observes('machine.probed', 'machine.can_tag'),


            stateObserver: function () {
                Ember.run.once(this, 'updateKeysButton');
                Ember.run.once(this, 'updateEnableButton');
            }.observes('machine.state'),


            changeMonitoringObserver: function() {
                Ember.run.once(this,  'updateChangeMonitoringButton');
            }.observes('machine.disablingMonitoring', 'machine.enablingMonitoring', 'machine.pendingMonitoring'),


            checkedMonitoringObserver: function() {
                Ember.run.once(this, 'updateMonitoringCollapsible');
            }.observes('Mist.backendsController.checkedMonitoring', 'machine')
        });
    }
);
