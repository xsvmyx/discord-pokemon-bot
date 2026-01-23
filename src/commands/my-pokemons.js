const { EmbedBuilder } = require("discord.js");
const getOrCreatePlayer = require("../utils/getOrCreatePlayer");
const fs = require("fs");
const path = require("path");

async function myPokemons(interaction) {

  const player = await getOrCreatePlayer(
    interaction.user,
    interaction.guildId
  );

  if (!player.ownedGifs || player.ownedGifs.length === 0) {
    return interaction.reply({
      content: "❌ You don't own any Pokémon GIFs yet.",
      flags: 64
    });
  }

 
  const pokemonName = interaction.options.getString("pokemon");

  // ==========================
  // CAS 1 : un Pokémon précis
  // ==========================

    if (pokemonName) {

    // lire le fichier JSON
    const gifsData = JSON.parse(
        fs.readFileSync("./pokemon/gifs.json", "utf8")
    );

    const searchedName = pokemonName.toLowerCase();

    // recherche dans le JSON
    const gifEntry = gifsData.find(
        g => g.name.toLowerCase() === searchedName
    );

    if (!gifEntry) {
        return interaction.reply({
        content: "❌ You don't own this Pokémon",
        flags: 64
        });
    }

    // 🔒 CHECK : le joueur le possède ?
    const ownsGif = player.ownedGifs.some(
        gif => gif.toLowerCase() === gifEntry.name.toLowerCase()
    );

    if (!ownsGif) {
        return interaction.reply({
        content: `🔒 You don't own **${gifEntry.name}** yet.`,
        flags: 64
        });
    }

    // chemin du fichier gif
    const gifPath = path.join(
        process.cwd(),
        "pokemon",
        gifEntry.file
    );

    return interaction.reply({
        files: [gifPath]
    });
    }


  // ==========================
  // CAS 2 : liste complète
  // ==========================
  const list = player.ownedGifs
    .map(gif => `• ${gif}`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setTitle("🎒 My Pokémon Collection")
    .setColor(0x2ECC71)
    .setDescription(list);

  await interaction.reply({
    embeds: [embed]
  });
}

module.exports = { myPokemons };
