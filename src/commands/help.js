const { EmbedBuilder } = require("discord.js");

module.exports = {help}


async function help(interaction) {
    const embed = new EmbedBuilder()
        .setTitle("📖 Bot Commands")
        .setColor(0xE3350D)
        .setDescription("Here are all available commands and how to use them");

embed.addFields(
    {
        name: "• /help",
        value: "Show this help menu"
    },
    {
        name: "• /guess",
        value:
            "Guess a Pokémon's name\n" +
            "**Options:**\n" +
            "`gen` *(optional)* — Pokémon generation (1–9)"
    },
    {
        name: "• /guess-gen",
        value: "Guess a Pokémon's generation"
    },
    {
        name: "• /guess-types",
        value: "Guess a Pokémon's type(s)"
    },
    {
        name: "• /lang",
        value:
            "Set your preferred language\n" +
            "**Options:**\n" +
            "`language` *(required)* — Pokémon name language"
    }
);

    await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
};
