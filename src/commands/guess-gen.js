const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    AttachmentBuilder
} = require("discord.js");

const generationRanges = require("../utils/generationRanges.js");
const getOrCreatePlayer = require("../utils/getOrCreatePlayer");
const { addPoints } = require('../utils/addPoints');
const { lockChannel, unlockChannel, isLocked } = require("../utils/gameLock");
const  pokedex  = require('../utils/pokedex.js');



async function guess_gen(interaction) {

    const channelId = interaction.channelId;
    
    
    if (isLocked(channelId)) {
        return interaction.reply({
        content: "⛔ A game is already running in this channel.",
        ephemeral: true
        });
    }

    lockChannel(channelId);

    const pokedexData = pokedex;

    const attemptedUsers = new Set();

    const min = 1;
    const max = 1025;

    const randomIdNum = Math.floor(Math.random() * (max - min + 1)) + min;
    const randomId = randomIdNum.toString().padStart(4, "0");

    const pokemon = pokedexData.find(p => p.id === randomId);
    if (!pokemon) {
        unlockChannel(channelId);
        return interaction.reply("Pokémon non trouvé 😢");
    }

    pixelMode = interaction.options.getBoolean("pixel") ?? false;
    const imageRelativePath = pixelMode
    ? pokemon.menu_sprite
    : pokemon.image_local;
    const pt = pixelMode ? 1 : 0.5;


    const imageFullPath = `./pokemon/${imageRelativePath}`;

    const file = new AttachmentBuilder(imageFullPath);

    const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setDescription("Which **generation** is this Pokémon?")
    .setImage(`attachment://${imageRelativePath.split("/").pop()}`);

  


    const rows = [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("gen1").setLabel("Gen 1").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen2").setLabel("Gen 2").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen3").setLabel("Gen 3").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen4").setLabel("Gen 4").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen5").setLabel("Gen 5").setStyle(ButtonStyle.Primary),
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("gen6").setLabel("Gen 6").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen7").setLabel("Gen 7").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen8").setLabel("Gen 8").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("gen9").setLabel("Gen 9").setStyle(ButtonStyle.Primary),
        )
    ];

    await interaction.reply({
        embeds: [embed],
        files: [file],
        components: rows
    });

    const collector = interaction.channel.createMessageComponentCollector({
        filter: i => !i.user.bot,
        time: 15000
    });

    collector.on("collect", async (btn) => {
        // ⛔ already tried
        if (attemptedUsers.has(btn.user.id)) {
            return btn.reply({
                content: "❌ You already used your attempt!",
                ephemeral: true
            });
        }

        attemptedUsers.add(btn.user.id);
        await btn.deferUpdate();

        const chosenGen = Number(btn.customId.replace("gen", ""));
        const range = generationRanges[chosenGen];

        const isCorrect =
            randomIdNum >= range.start &&
            randomIdNum <= range.end;

        const player = await getOrCreatePlayer(
            btn.user,
            interaction.guildId
        );

        const lang = player.language ?? "en";
        const name =
            pokemon.names[lang] ??
            pokemon.names["en"];
        const types = pokemon.types.join(" / ");
        
        if (isCorrect) {
            collector.stop("win");

            await interaction.followUp(
                `✅ **${btn.user.username}** answered correctly!\nIt was **${name}**\nGen: **${chosenGen}**\nType(s): **${types}**`
            );

            await addPoints(player, interaction.channel, pt);
        } else {
            await interaction.followUp(
                `❌ **${btn.user.username}** answered **Gen ${chosenGen}**!`
            );
        }
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

        await interaction.followUp(
            `⏱ Time up!\n`+`**Gen: ${gen}**\nPokémon: **${name}**\nTypes: **${types}**`,
        );
    });
}

function getPokemonGen(id) {
    for (const [gen, r] of Object.entries(generationRanges)) {
        if (id >= r.start && id <= r.end) return gen;
    }
    return "Unknown";
}

module.exports = {guess_gen};
