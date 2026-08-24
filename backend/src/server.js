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
    
    // Allow clients to join specific import_job rooms for targeted events
    socket.on('join_import_job', (importJobId) => {
        socket.join(`import_job_${importJobId}`);
        logger.info(`Socket ${socket.id} joined room import_job_${importJobId}`);
    });

    socket.on('leave_import_job', (importJobId) => {
        socket.leave(`import_job_${importJobId}`);
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