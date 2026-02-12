const { EmbedBuilder } = require("discord.js");

module.exports = {help}


async function help(interaction) {
    const embed = new EmbedBuilder()
        .setTitle("📖 Bot Commands")
        .setColor(0xE3350D)
        .setDescription("Here are all available commands and how to use them");

embed.addFields(

        
        {
            name: "🎮 Guessing Games",
            value:
                "**/guess-name** — Guess a Pokémon's name\n" +
                "• `gen` *(optional)* — Generation (1–9)\n" +
                "• `pixel` *(optional)* — Use pixel sprite\n\n" +

                "**/guess-gen** — Guess a Pokémon's generation\n" +
                "• `pixel` *(optional)* — Use pixel sprite\n\n" +

                "**/guess-types** — Guess a Pokémon's type(s)\n" +
                "• `pixel` *(optional)* — Use pixel sprite"
        },

        
        {
            name: "💰 Economy",
            value:
                "**/daily** — Claim daily PokéDollars\n" +
                "**/shop** — Buy animated Pokémon\n" +
                "**/check** — View player data\n" +
                "• `player` *(optional)* — Check another user"
        },

        
        {
            name: "📦 Collection",
            value:
                "**/my-pokemons** — View your collection\n" +
                "• `pokemon` *(optional)* — Show a specific Pokémon"
        },

        
        {
            name: "⚙️ Settings",
            value:
                "**/lang** — Set Pokémon name language\n" +
                "• `language` *(required)* — Choose language"
        },

       
        {
            name: "📘 Utility",
            value:
                "**/help** — Show this help menu"
        }
    );

    await interaction.reply({
        embeds: [embed],
        ephemeral: false
    });
};
