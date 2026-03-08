const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const userSockets = new Map(); // userId -> socketId
const onlineUsers = new Set(); // set of online userIds

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        connectTimeout: 60000
    });

    // Use JWT middleware to secure the connection
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            console.warn('❌ Socket Connection Rejected: No token provided');
            return next(new Error("Authentication error: No token provided"));
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.warn('❌ Socket Connection Rejected: Invalid token', err.message);
                return next(new Error("Authentication error: Invalid token"));
            }
            console.log(`✅ Socket Connection Authorized for User: ${decoded.user.id}`);
            socket.user = decoded.user; // Add user info to socket
            next();
        });
    });

    io.on('connection', (socket) => {
        const userId = socket.user.id;
        console.log(`⚡ User authenticated: ${userId} (Socket: ${socket.id})`);

        // Join a private room based on internal user ID
        socket.join(userId);
        userSockets.set(userId, socket.id);

        // Mark user as online and broadcast
        onlineUsers.add(userId);
        io.emit('userOnline', { userId });

        // Send the current online users list to the newly connected user
        socket.emit('onlineUsers', Array.from(onlineUsers));

        // Handle join room for a specific chat
        socket.on('joinRoom', (chatId) => {
            socket.join(`chat_${chatId}`);
            console.log(`👥 User ${userId} joined room chat_${chatId}`);
        });

        // Handle leave room
        socket.on('leaveRoom', (chatId) => {
            socket.leave(`chat_${chatId}`);
            console.log(`🚪 User ${userId} left room chat_${chatId}`);
        });

        socket.on('disconnect', () => {
            console.log('🔥 Socket disconnected:', socket.id);
            if (userSockets.get(userId) === socket.id) {
                userSockets.delete(userId);
                onlineUsers.delete(userId);
                // Broadcast user went offline
                io.emit('userOffline', { userId });
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const emitMessage = (recipientId, message) => {
    if (io) {
        io.to(recipientId).emit('receiveMessage', message);
    }
};

// ============================================
// JOB SEEKER REAL-TIME FEATURES
// ============================================

// Emit job count updates to all connected job seekers
const emitJobCountUpdate = (categoryData) => {
    if (io) {
        io.emit('jobCountUpdate', categoryData);
        console.log('📊 Broadcasted job count update to all clients');
    }
};

// Emit application status update to specific user
const emitApplicationStatusUpdate = (userId, applicationData) => {
    if (io) {
        io.to(userId).emit('applicationStatusUpdate', applicationData);
        console.log(`📬 Sent application status update to user: ${userId}`);
    }
};

// Emit new job posting notification to all job seekers
const emitNewJobPosted = (jobData) => {
    if (io) {
        io.emit('newJobPosted', jobData);
        console.log('🆕 Broadcasted new job posting to all clients');
    }
};

// Emit profile view notification to specific user
const emitProfileView = (userId, viewData) => {
    if (io) {
        io.to(userId).emit('profileView', viewData);
        console.log(`👁️ Sent profile view notification to user: ${userId}`);
    }
};

module.exports = { 
    initSocket, 
    getIO, 
    emitMessage,
    emitJobCountUpdate,
    emitApplicationStatusUpdate,
    emitNewJobPosted,
    emitProfileView
};
