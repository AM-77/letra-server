const scrap = require("../utils/scrap");
const Types = require("../utils/types");
const {
  BASE_URL,
  formatSearchURL,
  formatArtistsListURL,
  formatArtistURL,
  formatLyricsURL,
} = require("../utils/urls");

const home = (req, res) => {
  scrap(BASE_URL, Types.HOME)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(404).json(error);
    });
};

const artistsList = (req, res) => {
  const {
    params: { start },
  } = req;
  if (start && start.length === 1 && Number.isNaN(Number(start))) {
    scrap(formatArtistsListURL(start), Types.LIST_ARTISTS)
      .then((result) => {
        res.status(200).json(result).end();
      })
      .catch((error) => {
        res.status(404).json(error);
      });
  } else {
    res.status(400).json({ error: "Bad request" });
  }
};

const artistInfo = (req, res) => {
  const {
    params: { artist },
  } = req;
  if (artist) {
    scrap(formatArtistURL(artist), Types.ARTIST)
      .then((result) => {
        res.status(200).json(result).end();
      })
      .catch((error) => {
        res.status(404).json(error);
      });
  } else {
    res.status(400).json({ error: "Bad request" });
  }
};

const lyrics = (req, res) => {
  const {
    params: { artist, title },
  } = req;
  if (artist && title) {
    scrap(formatLyricsURL(artist, title), Types.LYRICS)
      .then((result) => {
        res.status(200).json(result).end();
      })
      .catch((error) => {
        res.status(404).json(error);
      });
  } else {
    res.status(400).json({ error: "Bad request" });
  }
};

const search = (req, res) => {
  const {
    params: { query },
  } = req;
  if (query) {
    const scrapTracks = scrap(
      formatSearchURL(encodeURI(query), "songs"),
      Types.SEARCH_TRACKS
    );
    const scrapAlbums = scrap(
      formatSearchURL(encodeURI(query), "albums"),
      Types.SEARCH_ALBUMS
    );
    const scrapArtists = scrap(
      formatSearchURL(encodeURI(query), "artists"),
      Types.SEARCH_ARTISTS
    );
    Promise.all([scrapTracks, scrapAlbums, scrapArtists])
      .then((results) => {
        res.status(200).json({
          tracks: results[0],
          albums: results[1],
          artists: results[2],
        });
      })
      .catch((error) => {
        res.status(404).json(error);
      });
  } else {
    res.status(400).json({ error: "Bad request" });
  }
};

module.exports = { home, artistsList, artistInfo, lyrics, search };
