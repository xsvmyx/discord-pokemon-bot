const packs = [
  // ======================
  // 🎁 BASIC PACK
  // ======================
  {
    id: "basic",
    name: "🎁 Basic Pack",
    price: 200,
    quantity: 1,
    description: "1 Pokémon GIF\nNormal chances",
    image: "legendss.jpg",
    rules: {
      rolls: [
        { type: "normal", chance: 85 },
        { type: "mega", chance: 10 },
        { type: "legendary", chance: 5 }
      ]
    }
  },

  // ======================
  // 💥 MEGA PACK
  // ======================
  {
    id: "mega",
    name: "💥 Mega Pack",
    price: 800,
    quantity: 1,
    description: "Higher chance for Mega Pokémon",
    image: "mega.jpg",
    rules: {
      rolls: [
        { type: "mega", chance: 45 },
        { type: "legendary", chance: 10 },
        { type: "normal", chance: 45 }
      ]
    }
  },

  // ======================
  // 🔥 LEGENDARY PACK
  // ======================
  {
    id: "legendary",
    name: "🔥 Legendary Pack",
    price: 1500,
    quantity: 1,
    description: "Legendary Pokémon possible",
    image: "legends.jpg",
    rules: {
      rolls: [
        { type: "legendary", chance: 33 },
        { type: "mega", chance: 20 },
        { type: "normal", chance: 47 }
      ]
    }
  },

  // ======================
  // ✨ MYTHICAL PACK
  // ======================
  {
    id: "mythical",
    name: "✨ Mythical Pack",
    price: 2000,
    quantity: 1,
    description: "Chance to obtain Mythical Pokémon",
    image: "mythical.jpg",
    rules: {
      rolls: [
        { type: "mythical", chance: 30},
        { type: "normal", chance: 70 }
      ]
    }
  },

  // ======================
  // 🌀 GIGANTAMAX PACK
  // ======================
  {
    id: "gigantamax",
    name: "🌀 Gigantamax Pack",
    price: 1000,
    quantity: 1,
    description: "Gigantamax Pokémon included",
    image: "legendss.jpg",
    rules: {
      rolls: [
        { type: "gigantamax", chance: 30 },
        { type: "legendary", chance: 10 },
        { type: "mega", chance: 20 },
        { type: "normal", chance: 40 }
      ]
    }
  }
];

module.exports = packs;
