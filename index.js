var Promise = require('promise');
var request = require('superagent');
var M3U = require('playlist-parser').M3U;
var _compact = require('lodash.compact');

var clid;

// Some functions that help along the way
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
var getRandomIntInclusive = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Thanks michaelowens, :)
// Simple titlecase thing, capitalize first letter
var titleCase = function(str) {
    return str.split(' ').map(function(word) { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); }).join(' ');
}


// Twitch functions
var getAccessToken = function(channel) {
  // Get access token
  return new Promise(function(resolve, reject) {
    request
      .get('https://api.twitch.tv/api/channels/' + channel + '/access_token')
      .set({ 'Client-ID': clid })
      .end(function(err, res) {
        if (err) return reject(err);
        if (!res.ok) return reject(new Error('Could not access the twitch API to get the access token, maybe your internet or twitch is down.'));
        
        return resolve(res.body);
      });
  });
}

var getPlaylist = function(channel, accessToken) {
  // Get the playlist with given access token data (parsed /access_token response)
  return new Promise(function(resolve, reject) {
    request
      .get('https://usher.ttvnw.net/api/channel/hls/' + channel + '.m3u8')
      .set({ 'Client-ID': clid })
      .query({
        player: 'twitchweb',
        token: accessToken.token,
        sig: accessToken.sig,
        allow_audio_only: true,
        allow_source: true,
        type: 'any',
        p: getRandomIntInclusive(1, 99999)
      })
      .buffer() // buffer the response for m3u data
      .end(function(err, res) {
        if (err) return reject(err);
        if (!res.ok) return reject(new Error('Could not access the twitch API to get the playlist, maybe your internet or twitch is down.'));
        
        return resolve(res.text);
      });
  });
}

// Exposed functions
// Just get the playlist, return the string nothing else
var getPlaylistOnly = function(channel) {
  if (!channel) return Promise.reject(new Error('No channel defined.'));

  var channel = channel.toLowerCase(); // Twitch API only takes lowercase
  return getAccessToken(channel)
  .then(function(token) {
    return getPlaylist(channel, token);
  });
}

// Above get playlist, but then parses it and gives the object
var getPlaylistParsed = function(channel) {
  return getPlaylistOnly(channel)
  .then(function(data) {
    return Promise.resolve(_compact(M3U.parse(data)));
  });
}

var getStreamUrls = function(channel) { // This returns the one with a custom fully parsed object
  return getPlaylistParsed(channel)
  .then(function(playlist) {
    if (playlist.length < 1) return Promise.reject(new Error('There were no results, maybe the channel is offline?'));

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

    return Promise.resolve(streamLinks);
  });
}

module.exports = 
  function(clientid) {
    clid = clientid;
    return {
      get: Promise.nodeify(getStreamUrls),
      raw: Promise.nodeify(getPlaylistOnly),
      rawParsed: Promise.nodeify(getPlaylistParsed)          
    };
};
