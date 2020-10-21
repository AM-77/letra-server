const cheerio = require("cheerio");
const got = require("got");
const Types = require("./types");

const loadHTML = async (url) => {
  return cheerio.load((await got(url, { timeout: 10000 })).body);
};

const loadLyrics = async ($) => {
  const lyrics = {};
  $("body > div.container.main-page > div > .text-center > b").filter(
    function () {
      lyrics.title = $(this).text().replace(new RegExp(/\"/g), "");
    }
  );

  $("body > div.container.main-page > div > .text-center .lyricsh > h2").filter(
    function () {
      lyrics.artist = $(this).text().replace(" Lyrics", "");
      const link = $(this).find("a").attr("href");
      if (link) {
        lyrics.artistLink = `/artist${link.slice(link.lastIndexOf("/"), -5)}`;
      }
    }
  );

  $("body > div.container.main-page > div > .text-center div")
    .contents()
    .filter(function () {
      if (this.nodeType === 8) {
        lyrics.lyrics = $(this.parent)
          .text()
          .trim()
          .replace(new RegExp(/:/g), "")
          .split("\n");
      }
    });
  return lyrics;
};

const loadArtist = ($) => {
  const artist = {};
  const albums = [];
  $("body > div.container.main-page > div h1 > strong").filter(function () {
    artist.name = $(this).text().replace("Lyrics", "").trim();
  });

  $(".container.main-page div").filter(function () {
    $(this).each(function () {
      if ($(this).hasClass("album")) {
        const albumText = $(this).text();
        albums.push({
          title:
            albumText === "other songs:"
              ? albumText.slice(0, -1)
              : $(this).find("b").text().replace(new RegExp(/\"/g), ""),
          year:
            albumText !== "other songs:"
              ? albumText.slice(albumText.lastIndexOf("(") + 1, -1)
              : null,
          tracks: [],
        });
      }

      if ($(this).hasClass("listalbum-item")) {
        if (albums.length === 0) {
          albums.push({ title: "unknown", year: "unknown", tracks: [] });
        }
        albums[albums.length - 1].tracks.push({
          title: $(this).find("a").text(),
          link: `/lyrics${$(this).find("a").attr("href").slice(9, -5)}`,
        });
      }
    });

    artist.albums = albums;
  });

  return artist;
};

const loadHome = ($) => {
  const home = {};
  home.hotsongs = [];
  home.hotalbums = [];

  $("body > div.container.main-page .hotsongs").filter(function () {
    $(this)
      .html()
      .trim()
      .split("\n")
      .map((track) => {
        const trackText = $(track).text();
        if (trackText.length > 0) {
          const trackHref = $(track).attr("href");
          const artist = trackText
            .split("-")[0]
            .replace(new RegExp(/\"/g), "", "")
            .trim();
          const title = trackText
            .split("-")[1]
            .replace(new RegExp(/\"/g), "", "")
            .trim();
          const titleLink = trackHref.slice(18, trackHref.indexOf(".html"));
          const artistLink = `/artist/${trackHref
            .slice(26)
            .slice(0, trackHref.slice(26).indexOf("/"))}`;
          home.hotsongs.push({ artist, title, titleLink, artistLink });
        }
      });
  });

  $("body > div.container.main-page .albuma").filter(function () {
    const hotAlbum = $(this);
    const artist = hotAlbum.find("a").text();
    const album = hotAlbum.text().slice(hotAlbum.text().indexOf(' "') + 2, -1);
    const artwork = hotAlbum.find("img").attr("src");
    const link = `/artist/${hotAlbum
      .find("a")
      .attr("href")
      .slice(3, hotAlbum.find("a").attr("href").indexOf(".html"))}`;
    home.hotalbums.push({ artist, album, artwork, link });
  });

  return home;
};

const loadArtistsList = ($) => {
  const artists = [];
  $("body > div.container.main-page > div .artist-col a").filter(function () {
    const linkHref = $(this).attr("href");
    const name = $(this).text();
    const link = `/artist/${linkHref.slice(linkHref.indexOf("/") + 1, -5)}`;
    artists.push({ name, link });
  });
  return artists;
};

const searchTracks = ($) => {
  const tracks = [];
  $("body > div.container.main-page > div > div > div > table tbody a").filter(
    function () {
      const parentNode = $(this).has("b");
      if (parentNode.attr("href")) {
        const link = parentNode
          .attr("href")
          .slice(24, parentNode.attr("href").indexOf(".html"));
        tracks.push({
          title: parentNode.text().replace(new RegExp(/\"/g), "", "").trim(),
          titleLink: link,
          artist: parentNode.next().text(),
          artistLink: `/artist/${link
            .slice(8)
            .slice(0, link.slice(8).indexOf("/"))}`,
        });
      }
    }
  );
  return tracks;
};

const searchAlbums = ($) => {
  const albums = [];
  $("body > div.container.main-page > div > div > div > table tbody a").filter(
    function () {
      const parentNode = $(this).has("b");
      if (parentNode.attr("href")) {
        const parentNodeText = parentNode.text();
        albums.push({
          artist: parentNodeText
            .slice(0, parentNodeText.indexOf("-"))
            .replace(new RegExp(/\"/g), "", "")
            .trim(),
          album: parentNodeText
            .slice(parentNodeText.indexOf("-") + 2)
            .replace(new RegExp(/\"/g), "", "")
            .trim(),
          link: `/artist/${parentNode
            .attr("href")
            .slice(27, parentNode.attr("href").indexOf(".html"))}`,
        });
      }
    }
  );

  return albums;
};

const searchArtists = ($) => {
  const artists = [];
  $("body > div.container.main-page > div > div > div > table tbody a").filter(
    function () {
      const parentNode = $(this).has("b");
      artists.push({
        name: parentNode.text(),
        link: `/artist/${parentNode
          .attr("href")
          .slice(27, parentNode.attr("href").indexOf(".html"))}`,
      });
    }
  );
  return artists;
};

const scrap = async (url, type) => {
  const $ = await loadHTML(url);

  switch (type) {
    case Types.LYRICS:
      return loadLyrics($);

    case Types.ARTIST:
      return loadArtist($);

    case Types.HOME:
      return loadHome($);

    case Types.LIST_ARTISTS:
      return loadArtistsList($);

    case Types.SEARCH_TRACKS:
      return searchTracks($);

    case Types.SEARCH_ALBUMS:
      return searchAlbums($);

    case Types.SEARCH_ARTISTS:
      return searchArtists($);

    default:
      return null;
  }
};

module.exports = scrap;
