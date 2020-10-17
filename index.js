const http = require("http");
const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 3300;
const server = http.createServer(app);

server.listen(PORT);
module.exports = server;
