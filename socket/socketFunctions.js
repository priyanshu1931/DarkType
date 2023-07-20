const Text = require('../models/Text');
const Game = require('./../models/Game');

async function startGame(io, gameId) {
    const game = await Game.findById(gameId);
    game.startTime = new Date().getTime();
    await game.save();

    let time = 60;
    const timerId = setInterval((function gameIntervalFunction() {
        if (time >= 0) {
            io.to(gameId).emit('timer', {
                message: "Time remaining.",
                time
            });
            time -= 1;
        }
        return gameIntervalFunction;
    })(), 1000);
}

module.exports.createOrJoinGame = async function (io, socketId, socket, name = "Anonymous", difficulty = "easy") {
    // console.log(io, socketId, name, difficulty);
    try {
        const player = { socketId, name }
        const game = await Game.findOrCreateGame(difficulty, player);
        const gameId = game._id.toString();
        socket.join(gameId)
        io.to(gameId).emit('updateGame', {
            message: "Waiting for players to join.",
            game
        });
        if (game.remainingPlayers == 0) {
            game.canJoin = false;
            await game.save();
            let countDown = 5;
            const timerId = setInterval(async () => {
                if (countDown >= 0) {
                    io.to(gameId).emit('timer', {
                        countDown,
                        message: "Game Starting"
                    });
                    countDown -= 1;
                } else {
                    clearInterval(timerId);
                    io.to(gameId).emit('updateGame', {
                        message: "Game Started.",
                        game
                    });
                    startGame(io, gameId);
                }
            }, 1000);
        }
    } catch (err) {
        console.log(err)
    }
}