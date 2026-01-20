const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },

    username: { type: String, required: true },

    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    language: { type: String, default: "en" },

    // 💰 économie
    pokedollars: { type: Number, default: 0 },
    lastDaily: { type: Date, default: null },


    ownedGifs: {
    type: [String],
    default: []
  }
});

// unicité par serveur
playerSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model("Player", playerSchema);
