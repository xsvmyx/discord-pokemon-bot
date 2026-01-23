const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder
} = require("discord.js");
const getRandomGif = require("../utils/getRandomGif");
const path = require("path");
const fs = require("fs");
const getOrCreatePlayer = require("../utils/getOrCreatePlayer");
const {pay} = require("../utils/pay");;


let isBuying = false;


const packs = [
  {
    id: "basic",
    name: "🎁 Pack Basique",
    price: 200,
    description: "1 GIF Pokémon\nProbabilité normale",
    image: "legendss.jpg"
  },
  {
    id: "rare",
    name: "💎 Pack Rare",
    price: 500,
    description: "3 GIFs Pokémon\nChance shiny augmentée",
    image: "mythical.jpg"
  },
  {
    id: "legend",
    name: "🔥 Pack Légendaire",
    price: 12000,
    description: "5 GIFs Pokémon\nChance légendaire",
    image: "mega.jpg"
  }
];

async function shop(interaction) {
  const player = await getOrCreatePlayer(
    interaction.user,
    interaction.guildId
  );

  let index = 0;


  const buildMessagePayload = () => {
    const pack = packs[index];

    const imagePath = path.join(
      __dirname,
      "..",
      "..",
      "assets",
      pack.image
    );

    const hasImage = fs.existsSync(imagePath);

    if (!hasImage) {
      console.log(`[SHOP] Image manquante : ${pack.image}`);
    }

    const embed = new EmbedBuilder()
      .setTitle(pack.name)
      .setColor(0xF1C40F)
      .setDescription(pack.description)
      .addFields(
      { name: "💰 Price", value: `${pack.price} Pokédollars`, inline: true },
      { name: "💳 Your Balance", value: `${player.pokedollars}`, inline: true },
      { name: "📦 Pack", value: `${index + 1} / ${packs.length}`, inline: true }

      );

    if (hasImage) {
      embed.setImage(`attachment://${pack.image}`);
    }

    const files = hasImage
      ? [new AttachmentBuilder(imagePath, { name: pack.image })]
      : [];

    return {
      embeds: [embed],
      components: [buildShopButtons(index,isBuying)],
      files
    };
  };



  //premier affichage reply
  const message = await interaction.reply({
    ...buildMessagePayload(),
    flags: 64, //<=> ephemeral: true,
  });

  const collector = message.createMessageComponentCollector({
    time: 60_000
  });




  //ici le collector du btn
collector.on("collect", async (btn) => {

  if (btn.user.id !== interaction.user.id) {
    return btn.reply({
      content: "❌ Ce shop n'est pas le tien",
      flags: 64 //<=> ephemeral: true,
    });
  }

  await btn.deferUpdate(); //alors ici , on dechire le ticket du btn (ACK que le bot a recu le click)

  // navigation
  if (btn.customId === "shop_prev") index--;
  if (btn.customId === "shop_next") index++;




  //####ACHAT
  //sans defer , on execute pay puis reply . mais dicord peut ne pas recevoir de ACK apres 3 secs et ca va crash
  if (btn.customId === "shop_buy_1") {

    isBuying = true;
    await interaction.editReply(buildMessagePayload()); // 🔒 boutons désactivés

    try {
      const result = await pay(player, packs[index], 1);

      if (!result.ok) {
        await btn.followUp({
          content: result.message,
          flags: 64
        });
        return;
      }

      const gif = getRandomGif();

      player.ownedGifs.push(gif);
      await player.save();

      await btn.followUp({
        content: `${result.message}\n🎁 You received: **${gif}**`,
        flags: 64
      });

      
    } catch (err) {
      console.error("[SHOP BUY ERROR]", err);

      await btn.followUp({
        content: "❌ An unexpected error occurred. The transaction has been cancelled.",
        flags: 64
      });

    }
    
    isBuying = false;
  }


  index = Math.max(0, Math.min(index, packs.length - 1));
  await interaction.editReply(buildMessagePayload());
});









  collector.on("end", () => {});
}










function buildShopButtons(index,isBuying) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("shop_prev")
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === 0),

    new ButtonBuilder()
      .setCustomId("shop_buy_1")
      .setLabel("Acheter x1")
      .setStyle(ButtonStyle.Success)
      .setDisabled(isBuying),

    new ButtonBuilder()
      .setCustomId("shop_buy_10")
      .setLabel("Acheter x10")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),

    new ButtonBuilder()
      .setCustomId("shop_next")
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === packs.length - 1)
  );
}

module.exports = { shop };
