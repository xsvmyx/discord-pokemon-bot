const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    AttachmentBuilder
} = require("discord.js");

const getOrCreatePlayer = require("../utils/getOrCreatePlayer");
const { addPoints } = require("../utils/addPoints");
const { ALL_TYPES } = require("../utils/allTypes");
const { lockChannel, unlockChannel, isLocked } = require("../utils/gameLock");
const pokedex = require("../utils/pokedex.js");

async function guess_types(interaction) {

    const channelId = interaction.channelId;

    if (isLocked(channelId)) {
        return interaction.reply({
            content: "⛔ A game is already running in this channel.",
            ephemeral: true
        });
    }

    lockChannel(channelId);

    const pokedexData = pokedex;
    const id = Math.floor(Math.random() * pokedexData.length);
    const pokemon = pokedexData[id];

    const file = new AttachmentBuilder(`./pokemon/${pokemon.image_local}`);

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription("Guess the **types** of this Pokémon")
        .setImage(`attachment://${pokemon.image_local.split("/").pop()}`);

    const options = ALL_TYPES.map(t => ({
        label: t,
        value: t
    }));

    const selectType1 = new StringSelectMenuBuilder()
        .setCustomId("type_1")
        .setPlaceholder("Type 1 (default: None)")
        .addOptions(options);

    const selectType2 = new StringSelectMenuBuilder()
        .setCustomId("type_2")
        .setPlaceholder("Type 2 (default: None)")
        .addOptions(options);

    const validateBtn = new ButtonBuilder()
        .setCustomId("validate_types")
        .setLabel("Validate")
        .setStyle(ButtonStyle.Success);

    const components = [
        new ActionRowBuilder().addComponents(selectType1),
        new ActionRowBuilder().addComponents(selectType2),
        new ActionRowBuilder().addComponents(validateBtn)
    ];

    await interaction.reply({
        embeds: [embed],
        files: [file],
        components
    });

    // 🧠 ÉTAT DU JEU — MULTI-JOUEURS
    const selections = new Map(); // Map<userId, { type_1, type_2 }>
    const attemptedUsers = new Set();
    let winner = null;

    const filter = i => !i.user.bot;

    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 20000
    });

    collector.on("collect", async i => {

        // 🚫 Déjà tenté
        if (attemptedUsers.has(i.user.id)) {
            await i.reply({
                content: "❌ You already used your attempt!",
                ephemeral: true
            });
            return;
        }

        // 🎛 Sélecteurs
        if (i.isStringSelectMenu()) {
            const userId = i.user.id;

            if (!selections.has(userId)) {
                selections.set(userId, {
                    type_1: "None",
                    type_2: "None"
                });
            }

            selections.get(userId)[i.customId] = i.values[0];
            await i.deferUpdate();
            return;
        }

        // ✅ Validation
        if (i.isButton() && i.customId === "validate_types") {
            await i.deferUpdate();

            attemptedUsers.add(i.user.id);

            const userChoices = selections.get(i.user.id) ?? {
                type_1: "None",
                type_2: "None"
            };

            const chosenTypes = Object.values(userChoices)
                .filter(t => t !== "None")
                .sort();

            const pokemonTypes = [...pokemon.types].sort();

            const isCorrect =
                chosenTypes.length === pokemonTypes.length &&
                chosenTypes.every((t, idx) => t === pokemonTypes[idx]);

            const player = await getOrCreatePlayer(
                i.user,
                interaction.guildId
            );

            if (isCorrect) {
                winner = i.user;

                await addPoints(player, interaction.channel, 1);

                // 🔒 Désactive tous les composants
                await interaction.editReply({
                    components: []
                });

                collector.stop("correct");
                return;
            } else {
                await i.followUp({
                    content: `❌ **Wrong answer, ${i.user.username}!**`,
                    ephemeral: true
                });
            }
        }
    });

    collector.on("end", async (_, reason) => {
        unlockChannel(channelId);

        const player = await getOrCreatePlayer(
            interaction.user,
            interaction.guildId
        );

        const lang = player.language ?? "en";
        const name = pokemon.names[lang] ?? pokemon.names["en"];
        const types = pokemon.types.join(" / ");
        const gen = pokemon.gen;

        if (reason === "correct") {
            await interaction.followUp({
                content:
                    `Pokémon: **${name}**\n` +
                    `Gen: **${gen}**\n` +
                    `Types: **${types}**`
            });
        } else {
            await interaction.followUp({
                content:
                    `⏱ **Time up!**\n` +
                    `Pokémon: **${name}**\n` +
                    `Gen: **${gen}**\n` +
                    `Types: **${types}**`
            });
        }
        collector.stop("correct");
    });
}

module.exports = { guess_types };
