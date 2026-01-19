const path = require("path");
const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");

const getOrCreatePlayer = require("../utils/getOrCreatePlayer");

module.exports = { check };

async function check(interaction) {
    //recuperer le user en param sinon c'est celui qui a execute la commande

    const user =  interaction.options.getUser("player") ?? interaction.user;
    const player = await getOrCreatePlayer(user, interaction.guildId);

    // =========================
    // Canvas setup (plus grand)
    // =========================
    const canvas = createCanvas(900, 400);
    const ctx = canvas.getContext("2d");

    // =========================
    // Background
    // =========================
    const bg = await loadImage(
        path.join(__dirname, "../../assets/bg.png")
    );
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // =========================
    // Avatar (round)
    // =========================
    const avatarURL = user.displayAvatarURL({
        extension: "png",
        size: 256,
        forceStatic: true
    });

    const avatar = await loadImage(avatarURL);

    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 170, 65, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 55, 105, 130, 130);
    ctx.restore();

    // Border avatar
    ctx.beginPath();
    ctx.arc(120, 170, 65, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFDE00";
    ctx.lineWidth = 5;
    ctx.stroke();

    // =========================
    // Text shadow
    // =========================
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = "#ffffff";

    // =========================
    // TEXT (AGRANDI)
    // =========================

    // Title
    ctx.font = "bold 46px sans-serif";
    ctx.fillText("Trainer Card", 240, 60);

    // Username
    ctx.font = "bold 38px sans-serif";
    ctx.fillText(player.username, 240, 120);

    // Level
    ctx.font = "34px sans-serif";
    ctx.fillText(`Level : ${player.level}`, 240, 180);

    // =========================
    // XP BAR (plus épaisse)
    // =========================
    const xpCurrent = player.points;
    const xpMax = player.level * 5;
    const xpPercent = Math.min(xpCurrent / xpMax, 1);

    const barX = 240;
    const barY = 200;
    const barWidth = 420;
    const barHeight = 24;

    // Background bar
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // XP fill
    ctx.fillStyle = "#FFDE00";
    ctx.fillRect(barX, barY, barWidth * xpPercent, barHeight);

    // XP text
    ctx.fillStyle = "#ffffff";
    ctx.font = "22px sans-serif";
    ctx.fillText(
        `XP : ${xpCurrent} / ${xpMax}`,
        barX,
        barY + 50
    );

    // PokéDollars
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(
        `PokéDollars : ${player.pokedollars}`,
        240,
        300
    );

    // =========================
    // Export image
    // =========================
    const attachment = new AttachmentBuilder(
        canvas.toBuffer("image/png"),
        { name: "trainer-card.png" }
    );

    // =========================
    // Embed
    // =========================
    const embed = new EmbedBuilder()
        .setColor(0x2A75BB)
        .setImage("attachment://trainer-card.png")
        .setTimestamp();

    await interaction.reply({
        embeds: [embed],
        files: [attachment]
    });
}
