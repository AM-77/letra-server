const Types = require("./types")
const request = require("request")
const cheerio = require("cheerio")

module.exports = (url, type) => {
    return new Promise((resolve, reject) => {

        let result = {}

        if (type !== Types.SEARCH_ALBUMS && type !== Types.SEARCH_ARTISTS && type !== Types.SEARCH_TRACKS)
            request(url, (error, response, html) => {

                switch (type) {
                    case Types.LYRICS:
                        if (!error) {
                            let $ = cheerio.load(html)

                            $("body > div.container.main-page > div > .text-center > b").filter(function () {
                                result.title = $(this).text().replace(new RegExp(/\"/g), "")
                            })

                            $("body > div.container.main-page > div > .text-center .lyricsh > h2 > b").filter(function () {
                                result.artist = $(this).text().replace(" Lyrics", "")
                            })

                            $('body > div.container.main-page > div > .text-center div').contents().filter(function () {
                                if (this.nodeType == 8) {
                                    result.lyrics = $(this.parent).text().trim().split("\n")
                                }
                            })

                        } else {
                            console.error("[!] There was an error in: scrap.js/switch/type.LYRICS \nError: " + error)
                            result.error = true
                        }
                        break

                    case Types.ARTIST:
                        if (!error) {
                            let $ = cheerio.load(html)
                            result.artist = ""
                            result.albums = []

                            $("body > div.container.main-page > div h1 > strong").filter(function () {
                                result.artist = $(this).text().replace("Lyrics", "").trim()
                            })

                            $('#listAlbum div, #listAlbum a').filter(function () {
                                $(this).each(function () {
                                    if ($(this).hasClass("album")) {
                                        result.albums.push({
                                            title: $(this).text(),
                                            tracks: []
                                        })
                                    } else {
                                        result.albums[(result.albums.length - 1)].tracks.push({
                                            title: $(this).text(),
                                            link: `/lyrics${$(this).attr("href").slice(9, -5)}`
                                        })

                                    }
                                })
                            })

                        } else {
                            console.error("[!] There was an error in: scrap.js/switch/type.ARTIST \nError: " + error)
                            result.error = true
                        }
                        break

                    case Types.HOME:
                        if (!error) {
                            let $ = cheerio.load(html)
                            result.hotsongs = []
                            result.hotalbums = []

                            $('body > div.container.main-page .hotsongs').filter(function () {
                                let hotsongs = $(this).text().trim().split("\n")
                                let hotsong = {
                                    artist: "",
                                    title: ""
                                }

                                hotsongs.map(track => {
                                    hotsong.artist = track.slice(0, track.indexOf("-")).replace("-", "").trim()
                                    hotsong.title = track.slice(track.indexOf("-")).replace("-", "").replace(new RegExp(/\"/g), "").trim()

                                    result.hotsongs.push(hotsong)
                                    hotsong = {
                                        artist: "",
                                        title: ""
                                    }
                                })
                            })

                            $('body > div.container.main-page .albuma').filter(function () {
                                let hotalbums = $(this).html()
                                let hotalbum = {
                                    artist: "",
                                    album: "",
                                    artwork: ""
                                }

                                hotalbum.artist = $(this).find("a").text()
                                hotalbum.album = $(this).text().slice($(this).text().indexOf(" \"") + 2, -1)
                                hotalbum.artwork = `${url}${hotalbums.slice(hotalbums.indexOf("img") + 9, hotalbums.indexOf("\" alt"))}`

                                result.hotalbums.push(hotalbum)
                            })


                        } else {
                            console.error("[!] There was an error in: scrap.js/switch/type.HOME \nError: " + error)
                            result.error = true
                        }
                        break

                    case Types.LIST_ARTISTS:
                        if (!error) {
                            let $ = cheerio.load(html)
                            result.artists = []

                            $('body > div.container.main-page > div .artist-col a').filter(function () {
                                let artist = {
                                    name: "",
                                    link: ""
                                }

                                artist.name = $(this).text()
                                artist.link = `/artist${$(this).attr("href").slice($(this).attr("href").indexOf("/"), -5)}`

                                result.artists.push(artist)
                            })

                        } else {
                            console.error("[!] There was an error in: scrap.js/switch/type.LIST_ARTISTS \nError: " + error)
                            result.error = true
                        }
                        break

                    default:
                        break
                }

                resolve(result)
            })
        else

            request(url, (error, response, html) => {
                if (!error) {
                    result = []
                    let $ = cheerio.load(html)
                    $("body > div.container.main-page > div > div > div > table tbody a").filter(function () {
                        if ($(this).has("b").attr("href")) {
                            switch (type) {
                                case Types.SEARCH_TRACKS:
                                    result.push({
                                        title: $(this).has("b").text(),
                                        link: $(this).has("b").attr("href").slice(24, $(this).has("b").attr("href").indexOf(".html"))
                                    })
                                    break;

                                case Types.SEARCH_ALBUMS:
                                    result.push({
                                        artist: $(this).has("b").text().slice(0, $(this).has("b").text().indexOf("-")).trim(),
                                        album: $(this).has("b").text().slice($(this).has("b").text().indexOf("-") + 2).trim(),
                                        link: "/artist/" + $(this).has("b").attr("href").slice(27, $(this).has("b").attr("href").indexOf(".html"))
                                    })
                                    break;

                                case Types.SEARCH_ARTISTS:
                                    result.push({
                                        name: $(this).has("b").text(),
                                        link: "/artist/" + $(this).has("b").attr("href").slice(27, $(this).has("b").attr("href").indexOf(".html"))
                                    })
                                    break;

                                default:
                                    break;
                            }
                        }
                    })

                } else {
                    console.error("[!] There was an error in: scrap.js/switch/type.SEARCH_MORE \nError: " + error)
                    result.error = true
                }

                resolve(result)
            })




    })

}