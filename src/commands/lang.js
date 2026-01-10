const getOrCreatePlayer = require("../utils/getOrCreatePlayer");

async function setLang(interaction) {
    const lang = interaction.options.getString("language");

    // Récupérer ou créer le player
    let player = await getOrCreatePlayer(interaction.user,interaction.guildId);

    // Mettre à jour sa langue
    player.language = lang;
    await player.save();

    await interaction.reply(`🌐 Your language has been set to **${lang}**!`);
}

module.exports = {setLang};
