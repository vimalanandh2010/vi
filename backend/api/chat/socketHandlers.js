let _io = null;

const socialOnlineUsers = new Set(); // Tracks active @handles

const registerSocialChatHandlers = (io) => {
    _io = io;

    io.on('connection', (socket) => {
        // Register handle and join room
        socket.on('sc:register', (chat_handle) => {
            if (!chat_handle || !chat_handle.startsWith('@')) return;
            const handle = chat_handle.toLowerCase().trim();
            socket.join(handle);
            socialOnlineUsers.add(handle);
            console.log(`[SocialChat] ${socket.id} joined room "${handle}"`);

            // Broadcast that user is online
            io.emit('sc:userOnline', { handle });

            // Send current online users list back
            socket.emit('sc:onlineUsers', Array.from(socialOnlineUsers));
        });

        socket.on('disconnect', () => {
            // Finding which handles this socket was in is harder without a map
            // but for simplicity, we'll tell the frontend to handle individual heartbeats
            // Or we could track socket.id -> handle in a map
        });

        // Manual leave
        socket.on('sc:leave', (chat_handle) => {
            if (!chat_handle) return;
            const handle = chat_handle.toLowerCase().trim();
            socket.leave(handle);
            socialOnlineUsers.delete(handle);
            io.emit('sc:userOffline', { handle });
        });
    });
};

const emitSocialMessage = (receiver_handle, payload) => {
    if (!_io || !receiver_handle) return;
    _io.to(receiver_handle.toLowerCase().trim()).emit('sc:receiveMessage', payload);
};

module.exports = { registerSocialChatHandlers, emitSocialMessage };
