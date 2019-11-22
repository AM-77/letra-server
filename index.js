const scrap = require("./scrap")
const types = require("./types")
const express = require('express')
const app = express()

const BASE_LINK = "https://www.azlyrics.com"
const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {

    scrap(BASE_LINK, types.HOME)
        .then((result) => {
            if (Object.keys(result).length === 0 && result.constructor === Object)
                res.status(200).json({
                    result: "Data Not Found."
                }).end()
            else
                res.status(200).json(result).end()
        })

})

app.get("/artists/:starts_with", (req, res) => {

    if (req.params.starts_with)
        scrap(`${BASE_LINK}/${req.params.starts_with}.html`, types.LIST_ARTISTS)
        .then((result) => {
            if (Object.keys(result).length === 0 && result.constructor === Object)
                res.status(200).json({
                    result: "Data Not Found."
                }).end()
            else
                res.status(200).json(result).end()
        })
    else
        res.status(200).json({
            error: "Unspecified artist's name."
        }).end()
})

app.get("/artist/:artist_name", (req, res, next) => {

    if (req.params.artist_name)
        scrap(`${BASE_LINK}/${req.params.artist_name.slice(0,1)}/${req.params.artist_name}.html`, types.ARTIST)
        .then((result) => {
            if (Object.keys(result).length === 0 && result.constructor === Object)
                res.status(200).json({
                    result: "Data Not Found."
                }).end()
            else
                res.status(200).json(result).end()
        })
    else
        res.status(200).json({
            error: "Unspecified artist's name."
        }).end()
})

app.get("/lyrics/:artist/:title", (req, res) => {

    if (req.params.artist && req.params.title)
        scrap(`${BASE_LINK}/lyrics/${req.params.artist.toLowerCase()}/${req.params.title.toLowerCase()}.html`, types.LYRICS)
        .then((result) => {
            if (Object.keys(result).length === 0 && result.constructor === Object)
                res.status(200).json({
                    result: "Data Not Found."
                }).end()
            else {
                res.status(200).json(result).end()
            }

        })
    else
        res.status(200).json({
            error: "Unspecified artist's name or track's title."
        }).end()
})

app.listen(PORT);