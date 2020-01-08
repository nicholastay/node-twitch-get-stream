var axios = require('axios');
var M3U = require('playlist-parser').M3U;
var qs = require('querystring');

const clientId = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

// Thanks michaelowens, :)
// Simple titlecase thing, capitalize first letter
var titleCase = function(str) {
    return str.split(' ').map(function(word) { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); }).join(' ');
}


// Twitch functions
var getAccessToken = function(channel) {
    // Get access token
    return axios.get('https://api.twitch.tv/api/channels/' + channel + '/access_token', {
        headers: {
            'Client-ID': clientId
        }
    }).then(function(res) {
        return res.data;
    });
}

var getPlaylist = function(channel, accessToken) {
    // Get the playlist with given access token data (parsed /access_token response)
    var query = {
        player: 'twitchweb',
        token: accessToken.token,
        sig: accessToken.sig,
        allow_audio_only: 'true',
        allow_source: 'true',
        type: 'any',
        p: Math.floor(Math.random() * 99999) + 1
    };

    return axios.get('https://usher.ttvnw.net/api/channel/hls/' + channel + '.m3u8?' + qs.stringify(query), {
        headers: {
            'Client-ID': clientId
        }
    }).then(function(res) {
        return res.data;
    });
}

// Exposed functions
// Just get the playlist, return the string nothing else
var getPlaylistOnly = function(channel) {
    if (!channel)
        return Promise.reject(new Error('No channel defined.'));

    var channel = channel.toLowerCase(); // Twitch API only takes lowercase
    return getAccessToken(channel)
        .then(function(token) {
            return getPlaylist(channel, token);
        });
}

// Above get playlist, but then parses it and gives the object
var getPlaylistParsed = function(channel) {
    if (!channel)
        return Promise.reject(new Error('No channel defined.'));
    
    return getPlaylistOnly(channel)
        .then(function(data) {
            // basically parse then _.compact (remove falsy values)
            return M3U.parse(data).filter(function(d) { return d; });
        });
}

var getStreamUrls = function(channel) { // This returns the one with a custom fully parsed object
    return getPlaylistParsed(channel)
        .then(function(playlist) {
            if (playlist.length < 1)
                throw new Error('There were no results, maybe the channel is offline?');

            // Parse playlist with quality options and send to new array of objects
            var streamLinks = [];
            for (var i = 0; i < playlist.length; i++) {
                // Quality option
                var name = playlist[i].title.match(/VIDEO=('|")(.*?)('|")/); // Raw quality name
                name = name[2]; // Get regex captured group

                // Rename checks
                // chunked = source
                if (name === 'chunked') name = 'source';
                // audio_only = Audio Only
                else if (name === 'audio_only') name = 'audio only';

                // Resolution
                var resMatch = playlist[i].title.match(/RESOLUTION=(.*?),/);
                var res = resMatch ? resMatch[1] : null // Audio only does not have a res so we need this check
                
                streamLinks.push({
                    quality: titleCase(name), // Title case the quality
                    resolution: res,
                    url: playlist[i].file
                });
            }

            return streamLinks;
        });
}

module.exports = {
    get: getStreamUrls,
    raw: getPlaylistOnly,
    rawParsed: getPlaylistParsed  
}