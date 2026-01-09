async function addPoints(player, channel,pts) {

    // Ajouter +1
    player.points += pts;

    // Seuil dynamique
    const threshold = 5 + (player.level - 1) * 5;

    // Level up ?
    let leveledUp = false;

    if (player.points >= threshold) {
        player.level += 1;
        player.points = 0;
        leveledUp = true;
    }

    // Sauvegarder
    await player.save();

    // Message normal
channel.send(`🎉 **${player.username}** earns **${pts} point**!  
They now have **${player.points}/${threshold} points**.`);

// Level up message
if (leveledUp) {
    channel.send(`🔥 **LEVEL UP!**  
${player.username} has reached **Level ${player.level}**! 🎉`);
}


    return player;
}

module.exports = { addPoints };
