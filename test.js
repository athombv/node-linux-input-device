var LinuxInputListener = require('./');

var SW_LID = 0x00;

var input = new LinuxInputListener('/dev/input/by-path/platform-gpio_keys-event');

input.on('state', function(value, key, kind) {
    console.log('State is now:', value, 'for key', key, 'of kind', kind);
});

input.on('error', console.error);

input.on('open', () => input.query('EV_SW', SW_LID));
