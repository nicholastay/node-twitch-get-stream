var request = require('request');
var playlistParsers = require('playlist-parser');
var M3U = playlistParsers.M3U;
var _us = require("underscore/underscore-min");

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Thanks michaelowens, :)
// Simple titlecase thing, capitalize first letter
function titleCase (str) {
    return str.split(' ').map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); }).join(' ');
}

function getAccessToken(channel, cb) {
  // Get access token
  request('http://api.twitch.tv/api/channels/' + channel + '/access_token', function (err, response, body) {
    if (!err && response.statusCode == 200) {
      return cb (null, JSON.parse(body));
    } else {
      return cb (new Error('Could not access the twitch API to get the access token'));
    }
  });
}

function getPlaylist(channel, accessToken, cb) {
  var url = 'http://usher.twitch.tv/api/channel/hls/' + channel + '.m3u8?player=twitchweb&&token=' + accessToken.token + '&sig=' + accessToken.sig + '&allow_audio_only=true&allow_source=true&type=any&p=' + getRandomIntInclusive(1, 99999);
  request(url, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      return cb (null, body);
    } else {
      return cb (new Error('Could not access the twitch API to get the playlist.'));
    }
  });
}

function getStreamUrls(chan, cb) { // This returns the one with an object
  if (!chan) {
    return cb (new Error("No channel given."));
  }

  var channel = chan.toLowerCase(); // Twitch API only takes lowercase
  getAccessToken(channel, function (err, response) {
    if (err) {
      return cb(err);
    }

    getPlaylist(channel, response, function (err, response) {
      if (err) {
        return cb (err);
      }

      var playlist = _us.compact(M3U.parse(response));

      if (playlist.length < 1) {
        return cb (new Error("There were no results, maybe the channel is offline?"));
      }

      // Parse playlist with quality options and send to new array of objects
      var streamLinks = [];
      for (var i = 0; i < playlist.length; i++) {
        // Quality option
        var name = playlist[i].title.match(/VIDEO="(.*?)"/); // Raw quality name
        name = name[1]; // Get regex captured group

        // chunked = source
        if (name === 'chunked') {
          name = "source";
        }

        // audio_only = Audio Only
        if (name === 'audio_only') {
          name = "audio only";
        }

        // Resolution
        var resMatch = playlist[i].title.match(/RESOLUTION=(.*?),/);
        var res = null;
        if (resMatch) {
          res = resMatch[1]; // Audio only does not have a res so we need this check
        } 
        
        streamLinks.push({
          quality: titleCase(name), // Title case the quality
          resolution: res,
          url: playlist[i].file
        });
      }

      return cb(null, streamLinks);
    });
  });
}

function getPlaylistOnly(chan, cb) { // Just gets the m3u8 initial playlist as string and hands to user
  if (!chan) {
    return cb (new Error("No channel given."));
  }

  var channel = chan.toLowerCase(); // Twitch API only takes lowercase
  getAccessToken(channel, function (err, response) {
    if (err) {
      return cb(err);
    }

    getPlaylist(channel, response, function (err, resp) {
      if (err) {
        return cb (err);
      }

      return cb(null, resp);
    });
  });
}

function getPlaylistParsed(chan, cb) { // Just gets the m3u8 initial playlist as string and hands to user
  if (!chan) {
    return cb (new Error("No channel given."));
  }

  var channel = chan.toLowerCase(); // Twitch API only takes lowercase
  getAccessToken(channel, function (err, response) {
    if (err) {
      return cb(err);
    }

    getPlaylist(channel, response, function (err, resp) {
      if (err) {
        return cb (err);
      }

      return cb(null, _us.compact(M3U.parse(resp)));
    });
  });
}

module.exports = {
  get: getStreamUrls,
  raw: getPlaylistOnly,
  rawParsed: getPlaylistParsed
};