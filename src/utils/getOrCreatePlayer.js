const Player = require("../models/Player");

async function getOrCreatePlayer(user, guildId) {
    let player = await Player.findOne({
        userId: user.id,
        guildId
    });

    if (player) return player;

    player = await Player.create({
        userId: user.id,
        guildId,
        username: user.username,
        points: 0,
        level: 1
        // language → default "en"
    });

    return player;
}

module.exports = getOrCreatePlayer;
