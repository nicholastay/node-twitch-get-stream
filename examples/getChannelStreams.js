var twitchStreams = require('../');

twitchStreams.get('Monstercat', function(error, streams) {
    if (error) return console.log('Error caught:', error);
    console.log('Got stream data.');
    for (var stream of streams) {
        console.log(stream.quality + ' (' + stream.resolution + '): ' + stream.url);
    }
})