const mongoose = require('mongoose');
const playerSchema = require('./Player');
const Text = require('./Text');

const gameSchema = new mongoose.Schema({
    text: [
        {
            type: String,
        }
    ],
    players: [playerSchema],
    canJoin: {
        type: Boolean,
        default: true
    },
    startTime: {
        type: Number,
    },
    remainingPlayers: {
        type: Number,
        default: 4
    }
});

gameSchema.statics.findOrCreateGame = async function (difficulty) {
    try {
        const games = await this.find({ canJoin: true })
            .sort({ remainingPlayers: 1 }) // Sorting in ascending order of remainingPlayers
            .limit(1); // Limiting the result to only one game, which will be the one with the minimum remainingPlayers

        if (games.length === 0) {
            // console.log("No game found. Creating a new game...");

            // Create a new game with default values
            const newGame = await this.create({
                text: await Text.getDocuments({ difficulty }),
                players: [],
                canJoin: true,
                startTime: null,
                remainingPlayers: 4,
            });

            // console.log("New game created:", newGame);
            return newGame;
        }

        const gameWithMinimumRemainingPlayers = games[0];
        // console.log("Game found:", gameWithMinimumRemainingPlayers);
        return gameWithMinimumRemainingPlayers;
    } catch (error) {
        console.error("Error finding or creating the game:", error);
        throw error;
    }
}

module.exports = mongoose.model('Game', gameSchema)