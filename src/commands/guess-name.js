// interactions.js
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const getOrCreatePlayer = require("../utils/getOrCreatePlayer");
const { addPoints } = require('../utils/addPoints');
const generationRanges = require('../utils/generationRanges');


async function guess(interaction) {
    const pokedexData = JSON.parse(fs.readFileSync('./pokemon/pokedex.json', 'utf8'));

    let genOption = interaction.options.get('gen')?.value;

    let min = 1;
    let max = 1025;

    if (genOption) {
        const range = generationRanges[genOption];
        if (range) {
            min = range.start;
            max = range.end;
        }
    }

    const randomIdNum = Math.floor(Math.random() * (max - min + 1)) + min;
    const randomId = randomIdNum.toString().padStart(4, '0');

    console.log("GEN:", genOption, "RANGE:", min, max);
    console.log("RANDOM:", randomId);

    const pokemon = pokedexData.find(p => p.id === randomId);
    if (!pokemon) return interaction.reply("Pokémon non trouvé 😢");

    const filePath = `./pokemon/${pokemon.image_local}`;
    const file = new AttachmentBuilder(filePath);

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription("Who's that Pokémon ?")
        .setImage(`attachment://${pokemon.image_local.split('/').pop()}`);

    await interaction.reply({ embeds: [embed], files: [file] });

    const channel = interaction.channel;

    try {
        const collected = await channel.awaitMessages({
            max: 1,
            time: 12000,
            errors: ['time']
        });

        const replyMsg = collected.first();
        const reply = replyMsg.content.toLowerCase();

        // ✅ ON UTILISE interaction (pas replyMsg.author)
        const player = await getOrCreatePlayer(interaction);

        const correct = Object.values(pokemon.names)
            .some(n => n.toLowerCase() === reply);

        if (correct) {
            await replyMsg.react("✅");
            await addPoints(player, channel, 2);
        } else {
            await replyMsg.react("❌");

            const lang = player.language ?? "en";
            const name = pokemon.names[lang] ?? pokemon.names["en"];

            channel.send(`It was **${name}**!`);
        }

    } catch {
        const player = await getOrCreatePlayer(interaction);

        const lang = player.language ?? "en";
        const name = pokemon.names[lang] ?? pokemon.names["en"];

        channel.send(`⏱ Time up! It was **${name}**.`);
    }
}






module.exports = { guess };






