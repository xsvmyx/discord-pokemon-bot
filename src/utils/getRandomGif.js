const fs = require("fs");
const path = require("path");

function rollType(rolls) {
  const rand = Math.random() * 100;
  let acc = 0;

  for (const roll of rolls) {
    acc += roll.chance;
    if (rand <= acc) return roll.type;
  }

  return rolls[rolls.length - 1].type;
}

function getRandomGif(pack) {
  if (!pack?.rules?.rolls) {
    throw new Error("Pack has no roll rules");
  }

  const jsonPath = path.join(
    __dirname,
    "..",
    "..",
    "src",
    "data",
    "gifs.json"
  );

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("gifs.json is empty or invalid");
  }

  //tirer le type
  const selectedType = rollType(pack.rules.rolls);

  //filtrer
  const pool = data.filter(gif => {
    switch (selectedType) {
      case "legendary": return gif.isLegendary;
      case "mythical": return gif.isMythical;
      case "mega": return gif.isMega && !gif.isLegendary;
      case "gigantamax": return gif.isGigantamax;
      case "normal":
      default:
        return (
          !gif.isLegendary &&
          !gif.isMythical &&
          !gif.isMega &&
          !gif.isGigantamax
        );
    }
  });

  if (pool.length === 0) {
    throw new Error(`No GIF available for type: ${selectedType}`);
  }

  //  tirer un GIF dans le pool
  const randomGif = pool[Math.floor(Math.random() * pool.length)];

  return randomGif.name;
}

module.exports = getRandomGif;
