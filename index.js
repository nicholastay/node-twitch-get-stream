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
      var playlist = M3U.parse(body);
      return cb (null, _us.compact(playlist));
    } else {
      return cb (new Error('Could not access the twitch API to get the playlist.'));
    }
  });
}

function getStreamUrls(channel, cb) {
  getAccessToken(channel, function (err, response) {
    if (err) {
      return cb(err);
    }

    getPlaylist(channel, response, function (err, response) {
      if (err) {
        return cb (err);
      }

      if (response < 1) {
        return cb (new Error("There were no results, maybe the channel is offline?"));
      }

      return cb(null, response);
    });
  });
}

module.exports = getStreamUrls;