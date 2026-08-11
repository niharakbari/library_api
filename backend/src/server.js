const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    
    // Allow clients to join specific workshop rooms for targeted events
    socket.on('join_workshop', (workshopId) => {
        socket.join(`workshop_${workshopId}`);
        logger.info(`Socket ${socket.id} joined room workshop_${workshopId}`);
    });

    socket.on('leave_workshop', (workshopId) => {
        socket.leave(`workshop_${workshopId}`);
    });

    socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
    });
});

server.listen(config.port, (err) => {
    if(err){
        console.log(err);
        console.log("Error starting the server");
    }

    logger.info("Server connected successfully on port " + config.port);
});