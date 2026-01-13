
const fs = require("fs");
const path = require("path");

const POKEDEX_PATH = path.join(
  process.cwd(), 
  "pokemon",
  "pokedex.json"
);

const pokedex = JSON.parse(fs.readFileSync(POKEDEX_PATH, "utf8"));

module.exports = pokedex;
