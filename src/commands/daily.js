const { EmbedBuilder } = require("discord.js");
const User = require("../models/Player");
const getOrCreatePlayer = require("../utils/getOrCreatePlayer");

const DAILY_AMOUNT = 200;
const DAY = 1000 * 60 * 60 * 24;

async function daily(interaction) {
    

    let user = await getOrCreatePlayer(interaction.user,interaction.guildId);
    const now = Date.now();

    if (user.lastDaily && now - user.lastDaily.getTime() < DAY) {
        const remaining =
            DAY - (now - user.lastDaily.getTime());

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining / (1000 * 60)) % 60);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0xE3350D)
                    .setTitle("⏳ Daily already claimed")
                    .setDescription(
                        `Come back in **${hours}h ${minutes}m**`
                    )
            ],
            //ephemeral: true
        });
    }

    user.pokedollars += DAILY_AMOUNT;
    user.lastDaily = new Date();
    await user.save();

    return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0x2ECC71)
                .setTitle("💰 Daily Reward")
                .setDescription(
                    `You received **${DAILY_AMOUNT} PokéDollars**!\n\n` +
                    `💵 Total: **${user.pokedollars}**`
                )
        ]
    });
}

module.exports = {daily};
