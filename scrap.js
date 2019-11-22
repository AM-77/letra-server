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

                default:
                    break
            }


            resolve(result)
        })
    })

}