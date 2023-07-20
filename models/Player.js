const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    currentWordIndex: {
        type: Number,
        default: 0
    },
    WPM: {
        type: Number,
        default: -1
    },
    socketID: {
        type: String,
    }
});

module.exports = playerSchema;