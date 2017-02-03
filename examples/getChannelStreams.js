var twitchStreams = require('../')('<client-id here - can be obtained from your twitch.tv settings -> connections -> register developer app>');

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