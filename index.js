require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const socket = require('socket.io');

// Connect Database
require('./database/db')()

// Routers
const textRouter = require('./routes/textRouter')

// Express Application
const app = express();


// Middlewares
app.use(cors());
app.use(express.json());

// Start Server
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// Socket
// const io = socket(server);

// Socket Functions import
// const socketFunctions = require('./socket/socketFunctions');

// Listening to Socket.io events
// io.on('connection', function (socket) {
//     console.log(`Socket ID: ${socket.id}`);

//     socket.on('create-game', socketFunctions.createGame);
// })

// Home Route
app.get('/', function (req, res) {
    res.send('<h1>Server is working.</h1>');
});

// Routes Configuration
app.use('/api/v1', textRouter)