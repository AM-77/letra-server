const { BASE_URL, SEARCH_URL } = process.env;

const formatSearchURL = (query, type) => {
  return `${SEARCH_URL}${query}&w=${type}&p=1`;
};

const formatArtistsListURL = (start) => {
  return `${BASE_URL}/${start}.html`;
};

const formatArtistURL = (artist) => {
  if (Number.isNaN(Number(artist.charAt(0)))) {
    return `${BASE_URL}/${artist.charAt(0)}/${artist}.html`;
  }
  return `${BASE_URL}/19/${artist}.html`;
};

const formatLyricsURL = (artist, title) => {
  return `${BASE_URL}/lyrics/${artist}/${title}.html`;
};

module.exports = {
  BASE_URL,
  formatSearchURL,
  formatArtistsListURL,
  formatArtistURL,
  formatLyricsURL,
};
