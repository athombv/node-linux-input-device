
var events		= require('events');
var util        = require('util');
var DeviceHandle = require('linux-device');

var INPUT_DEV	= '/dev/input/by-path/platform-gpio_keys-event';

var IOCTL_EV    = 'E'.charCodeAt(0);
var EVENT_SIZE  = 0x10;

var INPUT_KINDS = { EV_KEY: {IOCTL: 0x18, EV: 0x01}, 
                    EV_LED: {IOCTL: 0x19, EV: 0x11}, 
                    EV_SND: {IOCTL: 0x1a, EV: 0x12}, 
                    EV_SW:  {IOCTL: 0x1b, EV: 0x05}};
                    
var EV_CODES = {};
Object.keys(INPUT_KINDS).forEach(function(key) {
    EV_CODES[INPUT_KINDS[key].EV] = key;
});

function LinuxInputListener(input_dev) {
    input_dev = input_dev || INPUT_DEV;
        
    var self = this;
    events.EventEmitter.call(this);
    
    function rxState(err, buffer) {
        if(err) {
            self.emit('error',err);
            return;
        }

        var tv_sec = buffer.readUInt32LE(0);
        var tv_usec = buffer.readUInt32LE(4);
        var type = buffer.readUInt16LE(8);
        var code = buffer.readUInt16LE(10);
        var value = buffer.readUInt32LE(12);
        value = !!value;
        
        if(EV_CODES[type]) {
            self.emit('state', value, code, EV_CODES[type]);
        }
    }
    
    var device = new DeviceHandle(input_dev, false, EVENT_SIZE, rxState);

    this.query = function(kind, key) {
        if(!INPUT_KINDS[kind]) throw new ReferenceError("Invalid key kind.");
        var buffer = new Buffer(Math.floor(key/8)+1);
        var result;
        try {
            device.ioctl(DeviceHandle.IOCTL_READ, IOCTL_EV, INPUT_KINDS[kind].IOCTL, buffer);
            result = (buffer.readUInt8(Math.floor(key/8)) & (1 << key % 8)) !== 0;
            self.emit('state', result, key, kind);
        } catch(e){
            self.emit('error', e);
        }
        return result;
    };
    
    this.close = function(cb) {
        device.close(cb);
    };
}

util.inherits(LinuxInputListener, events.EventEmitter);

LinuxInputListener.KEY_KINDS = Object.keys(INPUT_KINDS);

module.exports = LinuxInputListener;