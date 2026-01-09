const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    AttachmentBuilder
} = require("discord.js");

const fs = require("fs");
const generationRanges = require("../utils/generationRanges.js");
const getOrCreatePlayer = require("../utils/getOrCreatePlayer");
const { addPoints } = require('../utils/addPoints');

async function guess_gen(interaction) {

    const pokedexData = JSON.parse(fs.readFileSync('./pokemon/pokedex.json', 'utf8'));

    // sélectionner un Pokémon au hasard
    const min = 1;
    const max = 1025;

    const randomIdNum = Math.floor(Math.random() * (max - min + 1)) + min;
    const randomId = randomIdNum.toString().padStart(4, "0");

    const pokemon = pokedexData.find(p => p.id === randomId);
    if (!pokemon) return interaction.reply("Pokémon non trouvé 😢");

    const filePath = `./pokemon/${pokemon.image_local}`;
    const file = new AttachmentBuilder(filePath);

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription("Which **generation** is this Pokémon from?")
        .setImage(`attachment://${pokemon.image_local.split('/').pop()}`);

    //
    // 🔘 9 BOUTONS GEN 1 → GEN 9
    //
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId("gen1").setLabel("Gen 1").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen2").setLabel("Gen 2").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen3").setLabel("Gen 3").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen4").setLabel("Gen 4").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen5").setLabel("Gen 5").setStyle(ButtonStyle.Primary)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId("gen6").setLabel("Gen 6").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen7").setLabel("Gen 7").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen8").setLabel("Gen 8").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen9").setLabel("Gen 9").setStyle(ButtonStyle.Primary)
        );

    await interaction.reply({
        embeds: [embed],
        files: [file],
        components: [row, row2]
    });

    //
    // 🎯 ATTENDRE LE CLICK DU USER
    //
    const filter = i => i.user.id === interaction.user.id;

    try {
        const btn = await interaction.channel.awaitMessageComponent({
            filter,
            time: 15000
        });

        const chosenGen = Number(btn.customId.replace("gen", ""));

        console.log("GEN CLICKED:", chosenGen);
        console.log("POKÉMON ID:", randomIdNum);

        //
        // 📌 Vérifier si le Pokémon appartient à la génération cliquée
        //
        const range = generationRanges[chosenGen];
        const isCorrect = randomIdNum >= range.start && randomIdNum <= range.end;

        const player = await getOrCreatePlayer(interaction.user);

        if (isCorrect) {
            await btn.reply("✅ Correct!");
            await addPoints(player, interaction.channel,0.5);
        } else {
            const lang = player.language ;
            const name = pokemon.names[lang];

            await btn.reply(`❌ Wrong! It was **Gen ${getPokemonGen(randomIdNum)}**.\nPokémon: **${name}**`);
        }

    } catch (e) {
        const player = await getOrCreatePlayer(interaction.user);
        const lang = player.language ?? "en";
        const name = pokemon.names[lang] ?? pokemon.names["en"];

        return interaction.followUp(`⏱ Time up! It was **Gen ${getPokemonGen(randomIdNum)}**.\nPokémon: **${name}**`);
    }
}



function getPokemonGen(id) {
    for (const [gen, r] of Object.entries(generationRanges)) {
        if (id >= r.start && id <= r.end) return gen;
    }
    return "Unknown";
}

module.exports = {guess_gen};
