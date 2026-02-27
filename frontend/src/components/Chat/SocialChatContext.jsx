import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import * as api from './ChatApi';

const SocialChatContext = createContext();

export const useSocialChat = () => useContext(SocialChatContext);

export const SocialChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const socketRef = useRef(null);

    useEffect(() => {
        if (user) {
            api.getMyProfile().then(res => setProfile(res.data)).catch(() => setProfile(null));
        }
    }, [user]);

    useEffect(() => {
        if (profile?.chat_handle) {
            const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
                auth: { token: localStorage.getItem('seekerToken') || localStorage.getItem('recruiterToken') }
            });

            socket.on('connect', () => {
                socket.emit('sc:register', profile.chat_handle);
            });

            socket.on('sc:receiveMessage', ({ conversationId, message }) => {
                if (activeConvo?._id === conversationId) {
                    setMessages(prev => [...prev, message]);
                }
                // Refresh conversations to update last message
                api.getConversations().then(res => setConversations(res.data));
            });

            socket.on('sc:onlineUsers', (users) => setOnlineUsers(new Set(users)));
            socket.on('sc:userOnline', ({ handle }) => setOnlineUsers(prev => new Set([...prev, handle])));
            socket.on('sc:userOffline', ({ handle }) => setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(handle);
                return next;
            }));

            socketRef.current = socket;
            api.getConversations().then(res => setConversations(res.data));

            return () => socket.disconnect();
        }
    }, [profile?.chat_handle, activeConvo?._id]);

    const sendMessage = async (text) => {
        if (!activeConvo || !profile) return;
        const receiver_handle = activeConvo.participants.find(p => p !== profile.chat_handle);
        const res = await api.sendMessage(activeConvo._id, { text, receiver_handle });
        setMessages(prev => [...prev, res.data]);
        api.getConversations().then(res => setConversations(res.data));
    };

    const selectConversation = async (convo) => {
        setActiveConvo(convo);
        const res = await api.getMessages(convo._id);
        setMessages(res.data);
    };

    return (
        <SocialChatContext.Provider value={{
            profile, setProfile, conversations, activeConvo, messages, onlineUsers,
            sendMessage, selectConversation, setConversations
        }}>
            {children}
        </SocialChatContext.Provider>
    );
};
