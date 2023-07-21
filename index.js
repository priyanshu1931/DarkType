require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const socket_io = require('socket.io');


// Connect Database
require('./database/db')()


// Routers
const textRouter = require('./routes/textRouter')


// Express Application
const app = express();
const server = http.createServer(app)


// Middlewares
app.use(cors());
app.use(express.json());


// Socket
const io = socket_io(server);


// Socket Functions
const socketFunctions = require('./socket/socketFunctions')

// Listening to Socket.io events
io.on('connection', function (socket) {
    console.log(`Socket ID: ${socket.id}`);

    socket.on('start-game', async ({ name, difficulty, mode, duration }) => socketFunctions.createOrJoinGame(io, socket.id, socket, name, difficulty, mode, duration));
    socket.on('user-input', async ({ userInput, gameId }) => socketFunctions.userInput(io, socket.id, socket, userInput, gameId));
});


// Start Server
const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`App running on port ${port}...`);
});


// Home Route
app.get('/', function (req, res) {
    res.send('<h1>Server is working.</h1>');
});


// Routes Configuration
app.use('/api/v1', textRouter)