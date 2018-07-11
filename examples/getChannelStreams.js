var clid = require('./clid.json').clid; // place in clid.json as a property 'clid' - can be obtained from your twitch.tv settings -> connections -> register developer app
var twitchStreams = require('../')(clid);

twitchStreams.get('Monstercat')
    .then(function(streams) {
        console.log('Got stream data.');

        for (var stream of streams)
            console.log(stream.quality + ' (' + stream.resolution + '): ' + stream.url);
    })
    .catch(function(error) {
        if (error)
            return console.log('Error caught:', error);
    });