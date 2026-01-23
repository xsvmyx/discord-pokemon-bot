
const fs = require("fs");
const path = require("path");

const GIFS_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "gifs.json"
);

const gifs = JSON.parse(fs.readFileSync(GIFS_PATH, "utf8"));

module.exports = gifs;
