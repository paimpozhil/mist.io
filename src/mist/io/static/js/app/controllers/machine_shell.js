define('app/controllers/machine_shell', ['app/models/command', 'ember'],
    /**
     * Machine Shell Controller
     *
     * @returns Class
     */
    function (Command) {
        return Ember.Object.extend(Ember.Evented, {

            /**
             *  Properties
             */

            command: null,
            machine: null,
            commandHistoryIndex: -1,


            /**
             *
             *  Methods
             *
             */

            open: function (machine) {
                this._clear();
                this.set('machine', machine);

                // Get the first ipv4 public ip to connect to
                var host = '';
                for (var i=0;i<machine.public_ips.length;i++){
                    if (machine.public_ips[i].search(':') == -1){
                        host = machine.public_ips[i];
                    }

                }
                if (host == '')
                    return false;

                // Open shell socket, give it a few shots
                var sock = undefined, retry = 0;
                while (sock == undefined) {
                    if (retry) {
                        warn('retry ' + retry);
                    }

                    sock = io.connect('/shell');
                    retry += 1;
                    if (retry > 5){
                        warn('failed to connect to shell socket after ' + retry + ' retries');
                        return false;
                    }
                }

                Mist.set('shell', sock);

                $('.ui-footer').hide(500);
                $('#machine-shell-popup').on('popupafteropen',
                    function(){
                        $('#machine-shell-popup').off('blur');
                        $(document).off('focusin');
                    }
                ).popup( "option", "dismissible", false ).popup('open');

                var resize = function() {
                    var columns = 80, rows = 8;  // minimums
                    var charWidth = charHeight = 0;
                    var maxWidth = window.innerWidth - 46;
                    var maxHeight = window.innerHeight - virtualKeyboardHeight() - 135;
                    // calculate fontSize
                    for (var fontSize = 6; fontSize < 12; fontSize++) {
                        $('.fontSizeTest').css('font-size', fontSize + 'px');
                        charWidth = $('.fontSizeTest').width();
                        charHeight = $('.fontSizeTest').height();
                        width = charWidth * columns;
                        height = charHeight * rows;
                        if (width > maxWidth || height > maxHeight) {
                            break;
                        }
                    }
                    // calculate number of columns
                    while (true) {
                        width = columns * charWidth;
                        if (width > maxWidth) {
                            break;
                        }
                        columns++;
                    }
                    // calculate number of rows
                    while (true) {
                        height = rows * charHeight;
                        if (height > maxHeight) {
                            break;
                        }
                        rows++;
                    }
                    warn(fontSize);
                    warn(columns);
                    warn(rows);
                    warn(width);
                    warn(height);
                    if (Mist.term) {
                        Mist.term.resize(columns, rows);
                        Mist.shell.emit('shell_resize', columns, rows);
                    }
                    $('#shell-return').css('font-size', fontSize + 'px');

                    $('#shell-return').width(width + 2);  // +2 to avoid wrapping issues
                    $('#shell-return').height(height);

                    // Put popup it in the center
                    $('#machine-shell-popup-popup').css('left', ((window.innerWidth - $('#machine-shell-popup-popup').width())/2)+'px');

                    if (!Terminal._textarea)
                        $('.terminal').focus();

                    // Make the hidden textfield focusable on android
                    if (Mist.term && Mist.term.isAndroid){
                        $(Terminal._textarea).width('100%');
                        $(Terminal._textarea).height($('#shell-return').height() + 60);
                    }
                    return [columns, rows]
                }

                $(window).on('resize', function() {
                    resize();
                    return true;
                });
                size = resize();
                columns = size[0];
                rows = size[1];

                var term = new Terminal({
                  cols: columns,
                  rows: rows,
                  screenKeys: true
                });
                term.on('data', function(data) {
                    Mist.shell.emit('shell_data', data);
                });

                term.open(document.getElementById('shell-return'));

                var payload = {'backend_id': machine.backend.id,
                               'machine_id': machine.id,
                               'host': host,
                               'columns': columns,
                               'rows': rows,
                               };
                Mist.shell.emit('shell_open', payload);
                Mist.shell.firstData = true;
                Mist.shell.on('shell_data', function(data){
                    term.write(data);
                    if (Mist.shell.firstData){
                        $('.terminal').focus();
                        Mist.shell.firstData = false;
                    }
                });
                term.write('Connecting to ' + host + '...\r\n');
                Mist.set('term', term);

                if(Terminal._textarea) {
                    // iOS virtual keyboard focus fix
                    $(document).off('focusin');

                    // Tap should trigger resize on Android for virtual keyboard to appear
                    if (Mist.term && Mist.term.isAndroid){
                        $('#shell-return').bind('tap',function(){
                            $(window).trigger('resize');
                        });
                    }
                    $(Terminal._textarea).show();
                }

            },

            close: function () {
                warn('closing shell');
                Mist.shell.emit('shell_close');
                Mist.term.destroy();
                Mist.shell.disconnect();
                $('#machine-shell-popup').popup('close');
                $(window).off('resize');
                this._clear();
                $('.ui-footer').show(500);
                if (Terminal._textarea)
                    $(Terminal._textarea).hide();

            },

            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _clear: function () {
                Ember.run(this, function () {
                    this.set('machine', null);
                });
            },


            _giveCallback: function (success, action) {
                if (this.callback) this.callback(success, action);
            },


            /**
             *
             *  Observers
             *
             */

            machinesObserver: function () {
                Ember.run.once(this, '_updateActions');
            }.observes('machines')
        });
    }
);
