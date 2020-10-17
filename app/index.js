const express = require("express");
const morgan = require("morgan");

const app = express();
const cors = require("cors");

require("dotenv").config();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("tiny"));
}

app.use("/api/v1", require("./routes"));

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((err, req, res) => {
  res.status(err.status || 500).json({
    message: err.message,
    method: err.method,
    url: err.url,
  });
});

module.exports = app;
