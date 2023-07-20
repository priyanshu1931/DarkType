const Text = require('../models/Text');
const Game = require('./../models/Game');

module.exports.createGame = async function ({ nickname, difficulty }) {
    try {
        const game = await Game.findOrCreateGame(difficulty);
        const player = {

        }

    } catch (err) {

    }
}