const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder
} = require("discord.js");

const path = require("path");
const fs = require("fs");
const getOrCreatePlayer = require("../utils/getOrCreatePlayer");

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
        { name: "💰 Prix", value: `${pack.price} Pokédollars`, inline: true },
        { name: "💳 Ton solde", value: `${player.pokedollars}`, inline: true },
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
      components: [buildShopButtons(index)],
      files
    };
  };



  //premier affichage
  const message = await interaction.reply({
    ...buildMessagePayload(),
    ephemeral: true,
  });

  const collector = message.createMessageComponentCollector({
    time: 60_000
  });




  //ici le collector du btn
collector.on("collect", async (btn) => {
  if (btn.user.id !== interaction.user.id) {
    return btn.reply({
      content: "❌ Ce shop n'est pas le tien",
      ephemeral: true
    });
  }

  if (btn.customId === "shop_prev") index--;
  if (btn.customId === "shop_next") index++;

  if (btn.customId === "shop_buy_1") {
    const price = packs[index].price;

    if (player.pokedollars < price) {
      return btn.reply({
        content: "❌ Pas assez de Pokédollars",
        ephemeral: true
      });
    }else{
      return btn.reply({
      content: "✅ Achat OK (logique à venir)",
      ephemeral: true
    });
    }

    
    
  }

  index = Math.max(0, Math.min(index, packs.length - 1));

  await btn.update(buildMessagePayload());
});

  collector.on("end", () => {});
}

function buildShopButtons(index) {
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
      .setDisabled(false),

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
