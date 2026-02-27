import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [incomingMessage, setIncomingMessage] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Only connect if we have a user and we haven't already connected for this user
        if (user && !socketRef.current) {
            const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
            console.log('🔗 Attempting to connect to socket at:', socketUrl);

            const token = (user.role === 'employer' || user.role === 'recruiter')
                ? localStorage.getItem('recruiterToken')
                : localStorage.getItem('seekerToken');

            if (!token) {
                console.warn('⚠️ No token found for socket authentication');
                return;
            }

            console.log(`🔌 Initializing Socket.IO connection [Role: ${user.role}]`);

            const newSocket = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket.IO Connected | ID:', newSocket.id);
                // Join the private room based on user ID immediately
                newSocket.emit('joinPrivateChat', user.id || user._id);
            });

            newSocket.on('connect_error', (error) => {
                console.error('❌ Socket.IO Connection Error:', error.message);
            });

            newSocket.on('receiveMessage', (data) => {
                console.log('📩 Socket: receiveMessage', data);
                setIncomingMessage(data);
            });

            newSocket.on('receivePrivateMessage', (data) => {
                console.log('📩 Socket: receivePrivateMessage', data);
                setIncomingMessage({ ...data, isPrivate: true });
            });

            // Presence tracking
            newSocket.on('onlineUsers', (userIds) => {
                setOnlineUsers(new Set(userIds));
            });

            newSocket.on('userOnline', ({ userId }) => {
                setOnlineUsers(prev => new Set([...prev, userId]));
            });

            newSocket.on('userOffline', ({ userId }) => {
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            });

            newSocket.on('disconnect', (reason) => {
                console.log('🔌 Socket Disconnected. Reason:', reason);
                if (reason === 'io server disconnect') {
                    newSocket.connect();
                }
            });

            socketRef.current = newSocket;
            setSocket(newSocket);

            return () => {
                if (socketRef.current) {
                    console.log('🧹 Cleaning up socket connection...');
                    socketRef.current.disconnect();
                    socketRef.current = null;
                    setSocket(null);
                }
            };
        }

        // Handle logout
        if (!user && socketRef.current) {
            console.log('🚪 User logged out, disconnecting socket...');
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
        }
    }, [user]);

    const isUserOnline = (userId) => onlineUsers.has(userId);

    const value = {
        socket,
        incomingMessage,
        setIncomingMessage,
        onlineUsers,
        isUserOnline
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatProvider;
