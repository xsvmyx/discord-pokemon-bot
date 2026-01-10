const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    AttachmentBuilder
} = require("discord.js");

const fs = require("fs");
const getOrCreatePlayer = require("../utils/getOrCreatePlayer");
const { addPoints } = require("../utils/addPoints");
const {ALL_TYPES} = require('../utils/allTypes');

async function guess_types(interaction) {
    const pokedexData = JSON.parse(
        fs.readFileSync("./pokemon/pokedex.json", "utf8")
    );

    const pokemon = pokedexData[Math.floor(Math.random() * pokedexData.length)];

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

    await interaction.reply({
        embeds: [embed],
        files: [file],
        components: [
            new ActionRowBuilder().addComponents(selectType1),
            new ActionRowBuilder().addComponents(selectType2),
            new ActionRowBuilder().addComponents(validateBtn)
        ]
    });

    const selections = {
        type_1: "None",
        type_2: "None"
    };

    const filter = i => i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 20000
    });

    collector.on("collect", async i => {

        // Dropdown
        if (i.isStringSelectMenu()) {
            selections[i.customId] = i.values[0];
            await i.deferUpdate();
            return;
        }

        // Bouton Validate
        if (i.isButton() && i.customId === "validate_types") {
            collector.stop();

            const player = await getOrCreatePlayer(interaction);

            const chosenTypes = Object.values(selections)
                .filter(t => t !== "None")
                .sort();

            const pokemonTypes = [...pokemon.types].sort();

            const isCorrect =
                chosenTypes.length === pokemonTypes.length &&
                chosenTypes.every((t, idx) => t === pokemonTypes[idx]);

            if (isCorrect) {
                await addPoints(player, interaction.channel, 1);
                await i.reply("✅ **Correct!** +1 point");
            } else {
                const lang = player.language ?? "en";
                const name = pokemon.names[lang] ?? pokemon.names["en"];

                await i.reply(
                    `❌ Wrong!\nPokémon: **${name}**\nTypes: **${pokemonTypes.join(" / ")}**`
                );
            }
        }
    });

    collector.on("end", async (_, reason) => {
        if (reason === "time") {
            const player = await getOrCreatePlayer(interaction);
            const lang = player.language ?? "en";
            const name = pokemon.names[lang] ?? pokemon.names["en"];

            await interaction.followUp(
                `⏱ Time up!\nPokémon: **${name}**\nTypes: **${pokemon.types.join(" / ")}**`
            );
        }
    });
}

module.exports = { guess_types };
