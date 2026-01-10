// interactions.js
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const getOrCreatePlayer = require("../utils/getOrCreatePlayer");
const { addPoints } = require('../utils/addPoints');
const generationRanges = require('../utils/generationRanges');


async function guess(interaction) {
    const pokedexData = JSON.parse(
        fs.readFileSync('./pokemon/pokedex.json', 'utf8')
    );

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

    const pokemon = pokedexData.find(p => p.id === randomId);
    if (!pokemon) {
        return interaction.reply("Pokémon non trouvé 😢");
    }

    const file = new AttachmentBuilder(`./pokemon/${pokemon.image_local}`);

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription("Who's that Pokémon ?")
        .setImage(`attachment://${pokemon.image_local.split('/').pop()}`);

    await interaction.reply({ embeds: [embed], files: [file] });

    const channel = interaction.channel;
    const endTime = Date.now() + 12000;
    let answered = false;

    while (!answered && Date.now() < endTime) {
        try {
            const collected = await channel.awaitMessages({
                max: 1,
                time: endTime - Date.now()
            });

            const replyMsg = collected.first();
            if (!replyMsg || replyMsg.author.bot) continue;

            const reply = replyMsg.content.toLowerCase();

            const correct = Object.values(pokemon.names)
                .some(n => n.toLowerCase() === reply);

            if (correct) {
                const player = await getOrCreatePlayer(
                    replyMsg.author,
                    interaction.guildId
                );

                await replyMsg.react("✅");
                
                if(genOption)
                await addPoints(player, channel, 1);  
                else await addPoints(player, channel, 2);

                answered = true;
            } else {
                await replyMsg.react("❌");
            }

        } catch {
            break;
        }
    }

    if (!answered) {
        const player = await getOrCreatePlayer(
            interaction.user,
            interaction.guildId
        );

        const lang = player.language ?? "en";
        const name = pokemon.names[lang] ?? pokemon.names["en"];

        channel.send(`⏱ Time up! It was **${name}**.`);
    }
}



module.exports = { guess };






