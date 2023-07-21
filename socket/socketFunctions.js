const Text = require('../models/Text');
const Game = require('./../models/Game');

// Starts the timer for given duration 
async function startGame(io, gameId, duration) {
    const game = await Game.findById(gameId);
    game.startTime = new Date().getTime();
    await game.save();

    let time = duration;
    const timerId = setInterval((function gameIntervalFunction() {
        if (time >= 0) {
            (async () => {
                io.to(gameId).emit('timer', {
                    message: "Time remaining.",
                    time
                });
                time -= 1;

                // If everybody finished typing before timer.
                const game = await Game.findById(gameId);
                if (game.playersFinished === game.players.length) {
                    io.to(gameId).emit("updateGame", game);
                    clearInterval(timerId);
                }
            })();
        }
        else {
            (async () => {
                try {
                    let endTime = new Date().getTime();
                    const game = await Game.findById(gameId);
                    if (!game) clearInterval(timerId);
                    let { startTime } = game;
                    game.isOver = true;
                    game.players.forEach((player, index) => {
                        game.players[index].WPM = calculateWPM(endTime, startTime, player);
                    })
                    await game.save();
                    io.to(gameId).emit("updateGame", game);
                    clearInterval(timerId);
                } catch (err) {
                    console.log(err);
                }
            })();
        }
        return gameIntervalFunction;
    })(), 1000);
}

// Calculate the speed.
const calculateWPM = (endTime, startTime, player) => {
    const timeTaken = ((endTime - startTime) / 1000) / 60;
    const wordsTyped = player.currentWordIndex;
    const WPM = Math.ceil(wordsTyped / timeTaken);
    return WPM;
}

module.exports.createOrJoinGame = async function (io, socketId, socket, name = "Anonymous", difficulty = "easy", mode = "solo", duration = 60) {
    // console.log(io, socketId, name, difficulty);
    try {
        const player = { socketID: socketId, name }
        const game = await Game.findOrCreateGame(difficulty, player, mode);
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
                    if (mode === "solo") startGame(io, gameId, duration);
                    else startGame(io, gameId, 60);
                }
            }, 1000);
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports.userInput = async function (io, socketId, socket, userInput, gameId) {
    const game = await Game.findById(gameId);
    if (game && !game.canJoin && !game.isOver) {
        const player = game.players.find((playerr) => playerr.socketID === socketId)
        if (game.text[player.currentWordIndex] === userInput.trim()) {
            player.currentWordIndex += 1;
            if (player.currentWordIndex !== game.text.length) {
                await game.save();
                io.to(gameId).emit("updateGame", game);
            }
            else {
                let endTime = new Date().getTime();
                let { startTime } = game;
                player.WPM = calculateWPM(endTime, startTime, player);
                game.playersFinished += 1;
                if (game.playersFinished === game.players.length) game.isOver = true;
                await game.save();
                io.to(gameId).emit("updateGame", game);
            }
        }
    }
}