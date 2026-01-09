const Player = require("../models/Player");

async function getOrCreatePlayer(user) {
    let player = await Player.findOne({ userId: user.id });

    
    if (player) return player;

    
    player = await Player.create({
        userId: user.id,
        username: user.username,
        points: 0,
        level: 1
    });

    return player;
}

module.exports = getOrCreatePlayer;
