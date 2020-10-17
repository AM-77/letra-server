process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../..");

chai.use(chaiHttp);
chai.should();

describe("Letra", () => {
  describe("GET /", () => {
    it("should fetch hotsongs & hotalbums", (done) => {
      chai
        .request(server)
        .get("/api/v1/")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.hotsongs.should.be.a("array");
          res.body.hotalbums.should.be.a("array");
          done(err);
        });
    });

    it("should be not found", (done) => {
      chai
        .request(server)
        .get("/")
        .end((err, res) => {
          res.should.have.status(404);
          done(err);
        });
    });
  });

  describe("GET /artists/:start", () => {
    it("should fetch list of artists", (done) => {
      chai
        .request(server)
        .get("/api/v1/artists/a")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done(err);
        });
    });

    it("should not fetch list of artists", (done) => {
      chai
        .request(server)
        .get("/api/v1/artists/$")
        .end((err, res) => {
          res.should.have.status(404);
          done(err);
        });
    });

    it("should return a bad request error", (done) => {
      chai
        .request(server)
        .get("/api/v1/artists/0")
        .end((err, res) => {
          res.should.have.status(400);
          done(err);
        });
    });
  });

  describe("GET /artist/:artist", () => {
    it("should fetch list of artists", (done) => {
      chai
        .request(server)
        .get("/api/v1/artist/pnl")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.name.should.be.a("string");
          res.body.albums.should.be.a("array");
          done(err);
        });
    });

    it("should fetch list of artists (name starts with a digit)", (done) => {
      chai
        .request(server)
        .get("/api/v1/artist/2pac")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.name.should.be.a("string");
          res.body.albums.should.be.a("array");
          done(err);
        });
    });

    it("should not find any artist", (done) => {
      chai
        .request(server)
        .get("/api/v1/artist/$$$")
        .end((err, res) => {
          res.should.have.status(404);
          done(err);
        });
    });
  });

  describe("GET /lyrics/:artist/:title", () => {
    it("should fetch the lyrics", (done) => {
      chai
        .request(server)
        .get("/api/v1/lyrics/eminem/rapgod")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.title.should.be.a("string");
          res.body.lyrics.should.be.a("array");
          done(err);
        });
    });

    it("should not find the lyrics", (done) => {
      chai
        .request(server)
        .get("/api/v1/lyrics/$$/$$")
        .end((err, res) => {
          res.should.have.status(404);
          done(err);
        });
    });
  });

  describe("GET /search/:query", () => {
    it("should search words in the titles, albums name or artists name", (done) => {
      chai
        .request(server)
        .get("/api/v1/search/her life")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.tracks.should.be.a("array");
          res.body.albums.should.be.a("array");
          res.body.artists.should.be.a("array");
          done(err);
        });
    });

    it("should not find any result", (done) => {
      chai
        .request(server)
        .get("/api/v1/lyrics/$$/$$")
        .end((err, res) => {
          res.should.have.status(404);
          done(err);
        });
    });
  });
});
