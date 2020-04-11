node-twitch-get-stream
==========================
Gets the m3u8 direct stream URLs of a live stream on twitch.tv.

**NOTE**: v0.6.0 breaking change - no longer needs client ID, as only one works as discussed in #9.

## Usage
`npm install --save twitch-get-stream`

```javascript
var twitchStreams = require('twitch-get-stream')
...
twitchStreams.get('channel')
    .then(function(streams) {
        ...
    });
```

The output will be as an array of objects, example:
```javascript
[
  {
    quality: 'Source',
    resolution: '1280x720',
    url: 'long_twitch_hls_url_here'
  }, {...}
]
```

### Other uses
```javascript
twitchStream.raw('channel');
twitchStream.rawParsed('channel');
```
Similar to above, however `.raw` is used for getting the raw m3u8 data as a string, and `.rawParsed` is used to get the raw data, parsed through the m3u8 lib into an object.


## Upgrading Notes
* 0.4.1 to 0.5.0 - `.nodeify()` support has been removed in favor of just using the native Promise over the npm package; thus, you **cannot use callbacks anymore**. If you really need callback support, look into some library that can change it back for you. The `superagent` library has also been removed, replaced with `axios`. This change should not affect external code interfacing the library.


## Other
If theres anything else you want with this module, do tell me but I just put together this module for another project I was working on. Feel free to issue a pull request if you have any code changes you want to contribute yourself.


## License
This project is licensed under the terms of the MIT license.
