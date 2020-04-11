var twitchStreams = require('../');

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