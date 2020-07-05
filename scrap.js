const Types = require("./types")
const cheerio = require("cheerio")
const got = require('got')

module.exports = (url, type) => {
    return new Promise( (resolve, reject) => {
        (async () => {
            
            let result = {}

            try {
                const response = await got('https://www.azlyrics.com/')
                let html = response.body

                let $ = cheerio.load(html)

                switch (type) {
                    case Types.LYRICS:
                        $("body > div.container.main-page > div > .text-center > b").filter(function () {
                            result.title = $(this).text().replace(new RegExp(/\"/g), "")
                        })

                        $("body > div.container.main-page > div > .text-center .lyricsh > h2 > b").filter(function () {
                            result.artist = $(this).text().replace(" Lyrics", "")
                        })

                        $('body > div.container.main-page > div > .text-center div').contents().filter(function () {
                            if (this.nodeType == 8) {
                                result.lyrics = $(this.parent).text().trim().replace(new RegExp(/:/g), "").split("\n")
                            }
                        })
                        break

                    case Types.ARTIST:
                        result.artist = ""
                        result.albums = []

                        $("body > div.container.main-page > div h1 > strong").filter(function () {
                            result.artist = $(this).text().replace("Lyrics", "").trim()
                        })

                        $('.container.main-page div').filter(function () {

                            $(this).each(function () {
                                if ($(this).hasClass("album")) {
                                    result.albums.push({
                                        title: ($(this).text() === "other songs:") 
                                            ? $(this).text().slice(0, -1) 
                                            : $(this).text().slice($(this).text().indexOf(":") + 1, $(this).text().indexOf("(")).replace(new RegExp(/\"/g), ""),
                                        year: ($(this).text() !== "other songs:") ? $(this).text().slice($(this).text().indexOf("(") + 1, $(this).text().indexOf(")")) : null,
                                        tracks: []
                                    })
                                }

                                if ($(this).hasClass("listalbum-item")) {
                                    if ( result.albums.length === 0 ) {
                                        result.albums.push({ title: "unknown", year: "unknown", tracks: [] })
                                    }
                                    result.albums[(result.albums.length - 1)].tracks.push({
                                        title: $(this).find("a").text(),
                                        link: `/lyrics${$(this).find("a").attr("href").slice(9, -5)}`
                                    })
                                }
                            })
                        })
                        break

                    case Types.HOME:
                        result.hotsongs = []
                        result.hotalbums = []

                        $('body > div.container.main-page .hotsongs').filter(function () {
                            let hotsongs = $(this).html().trim().split("\n")
                            let hotsong = {
                                artist: "",
                                title: "",
                                artist_link: "",
                                title_link: ""
                            }

                            hotsongs.map(track => {

                                if ($(track).text().length > 0) {

                                    hotsong.artist = $(track).text().split("-")[0].replace(new RegExp(/\"/g), "", "").trim()
                                    hotsong.title = $(track).text().split("-")[1].replace(new RegExp(/\"/g), "", "").trim()
                                    hotsong.title_link = $(track).attr("href").slice(18, $(track).attr("href").indexOf(".html"))
                                    hotsong.artist_link = "/artist/" + $(track).attr("href").slice(26).slice(0, $(track).attr("href").slice(26).indexOf("/"))

                                    result.hotsongs.push(hotsong)
                                    hotsong = {
                                        artist: "",
                                        title: "",
                                        artist_link: "",
                                        title_link: ""
                                    }
                                }

                            })
                        })

                        $('body > div.container.main-page .albuma').filter(function () {
                            let hotalbums = $(this).html()
                            let hotalbum = {
                                artist: "",
                                album: "",
                                artwork: "",
                                link: ""
                            }

                            hotalbum.artist = $(this).find("a").text()
                            hotalbum.album = $(this).text().slice($(this).text().indexOf(" \"") + 2, -1)
                            hotalbum.artwork = `${url}${hotalbums.slice(hotalbums.indexOf("img") + 9, hotalbums.indexOf("\" alt"))}`
                            hotalbum.link = "/artist/" + $(this).find('a').attr("href").slice(3, $(this).find('a').attr("href").indexOf(".html"))
                            result.hotalbums.push(hotalbum)
                        })
                        break

                    case Types.LIST_ARTISTS:
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
                        break

                    case Types.SEARCH_TRACKS:
                        result = []
                        $("body > div.container.main-page > div > div > div > table tbody a").filter(function () {
                            if ($(this).has("b").attr("href")) {
                            
   
                                result.push({
                                    title: $(this).has("b").text(),
                                    title_link: $(this).has("b").attr("href").slice(24, $(this).has("b").attr("href").indexOf(".html")),
                                    artist: $(this).has("b").next().text(),
                                    artist_link: "/artist/" + 
                                    $(this).has("b").attr("href").slice(24, $(this).has("b").attr("href").indexOf(".html")).slice(8)
                                        .slice(0, $(this).has("b").attr("href").slice(24, $(this).has("b").attr("href").indexOf(".html")).slice(8).indexOf("/"))
                                })
                            }
                        })
                        break

                    case Types.SEARCH_ALBUMS:
                        result = []
                        $("body > div.container.main-page > div > div > div > table tbody a").filter(function () {
                            if ($(this).has("b").attr("href")) {
                                result.push({
                                    artist: $(this).has("b").text().slice(0, $(this).has("b").text().indexOf("-")).trim(),
                                    album: $(this).has("b").text().slice($(this).has("b").text().indexOf("-") + 2).trim(),
                                    link: "/artist/" + $(this).has("b").attr("href").slice(27, $(this).has("b").attr("href").indexOf(".html"))
                                })
                            }
                        })
                        break

                    case Types.SEARCH_ARTISTS:
                        result = []
                        $("body > div.container.main-page > div > div > div > table tbody a").filter(function () {
                            result.push({
                                name: $(this).has("b").text(),
                                link: "/artist/" + $(this).has("b").attr("href").slice(27, $(this).has("b").attr("href").indexOf(".html"))
                            })
                        })
                        break

                    default:
                        break
                }

            }
            catch (error) {
                console.error("[!] There was an error : " + error)
                result.error = error.message
            }
            finally {
                resolve(result)
            }
        })()
    })
}
