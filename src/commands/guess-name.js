// interactions.js
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const getOrCreatePlayer = require("../utils/getOrCreatePlayer");
const { addPoints } = require('../utils/addPoints');
const generationRanges = require('../utils/generationRanges');
const { lockChannel, unlockChannel, isLocked } = require("../utils/gameLock");
const  pokedex  = require('../utils/pokedex.js');

async function guess(interaction) {

    const channelId = interaction.channelId;

    
    if (isLocked(channelId)) {
        return interaction.reply({
        content: "⛔ A game is already running in this channel.",
        ephemeral: true
        });
    }
    lockChannel(channelId);

    const pokedexData = pokedex;

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
        unlockChannel(channelId);
        return interaction.reply("Pokémon non trouvé 😢");
    }

    const file = new AttachmentBuilder(`./pokemon/${pokemon.image_local}`);

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription("Who's that Pokémon?")
        .setImage(`attachment://${pokemon.image_local.split('/').pop()}`);

    await interaction.reply({ embeds: [embed], files: [file] });

    const collector = interaction.channel.createMessageCollector({
        filter: msg => !msg.author.bot,
        time: 12000
    });

    collector.on("collect", async (msg) => {
        const reply = msg.content.toLowerCase();

        const correct = Object.values(pokemon.names)
            .some(n => n.toLowerCase() === reply);

        if (!correct) {
            await msg.react("❌");
            return;
        }

        const player = await getOrCreatePlayer(
            msg.author,
            interaction.guildId
        );

        await msg.react("✅");

        await addPoints(
            player,
            interaction.channel,
            genOption ? 1 : 2
        );

        collector.stop("win");
    });

    collector.on("end", async (_, reason) => {
        unlockChannel(channelId);
        if (reason === "win") return;

        const player = await getOrCreatePlayer(
            interaction.user,
            interaction.guildId
        );

        const lang = player.language ?? "en";
        const name = pokemon.names[lang] ?? pokemon.names["en"];
        const types = pokemon.types.join(" / ");
        const gen = pokemon.gen;

        interaction.channel.send(
            `**⏱ Time up!\n**`+`Pokémon: **${name}**\nGen: **${gen}**\nTypes: **${types}**`,
        );
    });
}



module.exports = { guess };






