node-twitch-get-stream
==========================
Gets the m3u8 direct stream URLs of a live stream on twitch.tv.

## Usage
`npm install --save twitch-get-stream`

```javascript
var twitchGetStreams = require('twitch-get-stream');
...
twitchGetStreams('channel', callback);
```
(where 'channel' is the channel of your choice)

## Other
If theres anything else you want with this module, do tell me but I just put together this module for another project I was working on. Feel free to issue a pull request if you have any code changes you want to contribute yourself.