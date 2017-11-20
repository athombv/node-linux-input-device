# node-linux-input-device
Native addon to communicate with linux input devices. 

Installation
------------

Install with `npm`:

``` bash
$ npm install linux-input-device
```

API
--------

**new LinuxInputListener( String devicePath )**

Creates a new LinuxInputListener instance.

 - `path` A path to a linux input device


**Event: state( Boolean state, Number keyCode, String keyKind )**

Fired when a key state changes or when a key is queried.

- `state` True if the key is pressed, false otherwise
- `keyCode` Code of the key whose state has changed
- `keyKind` Category of the key.  


**String[] LinuxInputListener.KEY_KINDS**

Array containing all supported key kinds, like EV_KEY, EV_SW, or EV_LED.


**LinuxInputListener.query( String keyKind, Number keyCode )**

Query the current key. Also fires the state event.

- `keyCode` Code of the key whose state to query
- `keyKind` Category of the key. Must be one of the strings in LinuxInputListener.KEY_KINDS


**LinuxInputListener.close([Function callback()])**

Closes the current device and invoke callback when the device is closed.

- `callback()` [optional] A callback function

Examples
--------


```
var LinuxInputListener = require('linux-input-device');

var SW_LID = 0x00;

var input = new LinuxInputListener('/dev/input/event0');

input.on('state', function(value, key, kind) {
    console.log('State is now:', value, 'for key', key, 'of kind', kind);
});

input.on('error', console.error);

//start by querying for the initial state.
input.on('open' => input.query('EV_SW', SW_LID));

```