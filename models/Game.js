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
    isOver: {
        type: Boolean,
        default: false
    },
    startTime: {
        type: Number
    },
    remainingPlayers: {
        type: Number,
        default: 2
    },
    playersFinished: {
        type: Number,
        default: 0
    }
});

gameSchema.statics.findOrCreateGame = async function (difficulty, player, mode) {
    try {
        const games = await this.find({ canJoin: true, difficulty })
            .sort({ remainingPlayers: 1 }) // Sorting in ascending order of remainingPlayers
            .limit(1); // Limiting the result to only one game, which will be the one with the minimum remainingPlayers

        if (games.length === 0) {
            // console.log("No game found. Creating a new game...");

            // Create a new game with default values
            let remainingPlayers = 4;
            if (mode === "solo") remainingPlayers = 1;
            const newGame = this.create({
                text: await Text.getDocuments({ difficulty }),
                players: [player],
                canJoin: true,
                startTime: null,
                remainingPlayers: remainingPlayers - 1,
            });
            // console.log("New game created:", newGame);
            return newGame;
        }
        const gameWithMinimumRemainingPlayers = games[0];
        gameWithMinimumRemainingPlayers.players.push(player);
        gameWithMinimumRemainingPlayers.remainingPlayers -= 1;

        // console.log("Game found:", gameWithMinimumRemainingPlayers);
        await gameWithMinimumRemainingPlayers.save();
        return gameWithMinimumRemainingPlayers;
    } catch (error) {
        console.error("Error finding or creating the game:", error);
        throw error;
    }
}

module.exports = mongoose.model('Game', gameSchema)