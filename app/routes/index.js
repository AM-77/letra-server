const express = require("express");

const router = express.Router();
const {
  home,
  artistsList,
  artistInfo,
  lyrics,
  search,
} = require("../controllers");

router.get("/", home);

router.get("/artists/:start", artistsList);

router.get("/artist/:artist", artistInfo);

router.get("/lyrics/:artist/:title", lyrics);

router.get("/search/:query", search);

module.exports = router;
