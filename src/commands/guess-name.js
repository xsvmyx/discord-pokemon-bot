// interactions.js
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const getOrCreatePlayer = require("../utils/getOrCreatePlayer");
const { addPoints } = require('../utils/addPoints');
const generationRanges = require('../data/generationRanges.js');
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

    try {
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

        const pokemons = pokedexData.filter(p => p.id === randomId);
        const pokemon = pokemons[Math.floor(Math.random() * pokemons.length)];

        if (!pokemon) {
            await interaction.reply("Pokémon non trouvé 😢");
            return;
        }

        const basePoints = genOption ? 1 : 2;
        const pixelMode = interaction.options.getBoolean("pixel") ?? false;

        const imageRelativePath = pixelMode
            ? pokemon.menu_sprite
            : pokemon.image_local;

        const pt = basePoints + (pixelMode ? 0.5 : 0);
        const imageFullPath = `./pokemon/${imageRelativePath}`;

        const file = new AttachmentBuilder(imageFullPath);

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setDescription("Who's that Pokémon?")
            .setImage(`attachment://${imageFullPath.split('/').pop()}`);

        await interaction.reply({ embeds: [embed], files: [file] });

        const collector = interaction.channel.createMessageCollector({
            filter: msg => !msg.author.bot,
            time: 12000
        });
        
        let winnerFound = false;

        collector.on("collect", async (msg) => {

            if(winnerFound) return;

            const reply = msg.content.toLowerCase();

            const correct = Object.values(pokemon.names)
                .some(n => normalize(n) === normalize(reply));

            if (!correct) {
                await msg.react("❌");
                return;
            }
                
            winnerFound = true;
        
            collector.stop("win");
            
        try{
            const player = await getOrCreatePlayer(
                msg.author,
                interaction.guildId
            );

            await msg.react("✅");
            await addPoints(player, interaction.channel, pt);
        }catch(e){
            console.err(e);
        }
            collector.stop("win");
        });

        collector.on("end", async (_, reason) => {
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
                `**⏱ Time up!**\nPokémon: **${name}**\nGen: **${gen}**\nTypes: **${types}**`
            );
        });

    } catch (err) {
        console.error("GUESS ERROR:", err);

        if (!interaction.replied) {
            await interaction.reply("❌ Une erreur est survenue.");
        }

    } finally {
        unlockChannel(channelId);
    }
}




module.exports = { guess };



function normalize(str) {
  return str
    .normalize("NFD")               // sépare lettres / accents
    .replace(/[\u0300-\u036f]/g, "") // supprime les accents
    .toLowerCase()
    .trim();
}



