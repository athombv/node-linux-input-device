"use strict";
const DeviceHandle = require('linux-device');

const IOCTL_EV	  = 'E'.charCodeAt(0);
const EVENT_SIZE  = 0x10;

const INPUT_KINDS = { EV_KEY: {IOCTL: 0x18, EV: 0x01}, 
					EV_LED: {IOCTL: 0x19, EV: 0x11}, 
					EV_SND: {IOCTL: 0x1a, EV: 0x12}, 
					EV_SW:	{IOCTL: 0x1b, EV: 0x05}};
					
const EV_CODES = {};
Object.keys(INPUT_KINDS).forEach(function(key) {
	EV_CODES[INPUT_KINDS[key].EV] = key;
});

class LinuxInputListener extends DeviceHandle {
	constructor(device) {
		super({
			path: device,
			absoluteSize: EVENT_SIZE,
			mode: DeviceHandle.constants.O_RDONLY,
			autoOpen: true
		});
		this.on('data', this._onData.bind(this));
	}
	
	_onData(buffer) {
		const tv_sec = buffer.readUInt32LE(0);
		const tv_usec = buffer.readUInt32LE(4);
		const type = buffer.readUInt16LE(8);
		const code = buffer.readUInt16LE(10);
		const value = !!buffer.readUInt32LE(12);
		
		if(EV_CODES[type]) {
			this.emit('state', value, code, EV_CODES[type]);
		}
	}
	
	async query(kind, key) {
		let buffer = new Buffer(Math.floor(key/8)+1);
		await this.ioctl(DeviceHandle.constants.IOCTL_READ, IOCTL_EV, INPUT_KINDS[kind].IOCTL, buffer);
		let result = (buffer.readUInt8(Math.floor(key/8)) & (1 << key % 8)) !== 0;
		this.emit('state', result, key, kind);
		return result;
	}
	
	static get KEY_KINDS() {
		return Object.keys(INPUT_KINDS);
	}
}

module.exports = LinuxInputListener;