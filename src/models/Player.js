const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },

    username: { type: String, required: true },

    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    language: { type: String, default: "en" }
});

// unicité par serveur
playerSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model("Player", playerSchema);


/*Mongoose fait un mapping (JS ↔ MongoDB), et ce n’est qu’au moment de l’utilisation qu’on interroge MongoDB.*/