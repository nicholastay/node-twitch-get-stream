node-twitch-get-stream
==========================
Gets the m3u8 direct stream URLs of a live stream on twitch.tv.

## Usage
`npm install --save twitch-get-stream`

```javascript
var twitchStreams = require('twitch-get-stream');
...
twitchStreams.get('channel', callback);
```
(where 'channel' is the channel of your choice)

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
twitchStream.raw('channel', callback);
twitchStream.rawParsed('channel', callback);
```
Similar to above, however `.raw` is used for getting the raw m3u8 data as a string, and `.rawParsed` is used to get the raw data, parsed through the m3u8 lib into an object.


## Other
If theres anything else you want with this module, do tell me but I just put together this module for another project I was working on. Feel free to issue a pull request if you have any code changes you want to contribute yourself.


## License
This project is licensed under the terms of the MIT license.