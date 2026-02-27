/**
 * Chat Module Socket Handlers
 * Rooms are keyed by chat_username (e.g. "john_seeker")
 * Events use the "cm:" prefix to avoid collision with existing socket events.
 */

let _io = null;

/**
 * Register the chat-module socket handlers on the shared io instance.
 * Called once from backend/utils/socket.js after io is created.
 * @param {import('socket.io').Server} io
 */
const registerChatModuleHandlers = (io) => {
    _io = io;

    // We listen for a dedicated connection namespace registration event.
    // This is emitted by the frontend ChatContext AFTER authentication.
    io.on('connection', (socket) => {
        // cm:register — called once per authenticated user with their chat_username
        socket.on('cm:register', (chat_username) => {
            if (!chat_username || typeof chat_username !== 'string') return;
            const room = chat_username.toLowerCase().trim();
            socket.join(room);
            console.log(`[CM] Socket ${socket.id} joined room "${room}"`);
        });

        // cm:leave — called when user navigates away from the chat module page
        socket.on('cm:leave', (chat_username) => {
            if (!chat_username) return;
            socket.leave(chat_username.toLowerCase().trim());
        });
    });
};

/**
 * Emit a new message event to a recipient's room.
 * Called from routes.js after saving a message.
 * @param {string} recipientUsername - The recipient's chat_username (room name)
 * @param {{ conversationId: string, message: object }} payload
 */
const emitChatModuleMessage = (recipientUsername, payload) => {
    if (!_io || !recipientUsername) return;
    _io.to(recipientUsername.toLowerCase().trim()).emit('cm:receiveMessage', payload);
};

module.exports = { registerChatModuleHandlers, emitChatModuleMessage };
