const fs = require("fs");
const path = require("path");

function getRandomGif() {
  const jsonPath = path.join(
    __dirname,
    "..",        // sort de utils
    "..",        // sort de src
    "pokemon",
    "gifs.json"
  );

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("gifs.json is empty or invalid");
  }

  const randomEntry = data[Math.floor(Math.random() * data.length)];
  
  return randomEntry.name; // ex: gifs/abomasnow-mega.gif
}

module.exports = getRandomGif;
