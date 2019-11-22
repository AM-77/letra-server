const Types = require("./types")
const request = require("request")
const cheerio = require("cheerio")
module.exports = (url, type) => {
    return new Promise((resolve, reject) => {

        let result = {}
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
                        console.error("[!] There was an error in: scrap.js/switch/type.LYRICS")
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
                        console.error("[!] There was an error in: scrap.js/switch/type.ARTIST")
                        result.error = true
                    }
                    break

                default:
                    break
            }


            resolve(result)
        })
    })

}