async function addPoints(player, channel, pts) {

    
    player.points += pts;

    let leveledUp = false;

    // Boucle au cas où gros gain d'XP (safe)
    while (true) {
        const threshold = 5 + (player.level - 1) * 5;

        if (player.points < threshold) break;

    
        player.points -= threshold;
        player.level += 1;
        leveledUp = true;
    }

    await player.save();

    const nextThreshold = 5 + (player.level - 1) * 5;

    
    channel.send(
        `🎉 **${player.username}** earns **${pts} point${pts !== 1 ? "s" : ""}**!\n` +
        `They now have **${player.points}/${nextThreshold} points**.`
    );

    //level up
    if (leveledUp) {
        channel.send(
            `🔥 **LEVEL UP!**\n` +
            `${player.username} has reached **Level ${player.level}**! 🎉`
        );
    }

    return player;
}

module.exports = { addPoints };
