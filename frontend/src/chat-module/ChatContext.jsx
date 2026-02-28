import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import * as api from './chatApi';

const ChatModuleContext = createContext(null);

export const useChatModule = () => {
    const ctx = useContext(ChatModuleContext);
    if (!ctx) throw new Error('useChatModule must be used inside ChatModuleProvider');
    return ctx;
};

export const ChatModuleProvider = ({ children }) => {
    const { user } = useAuth();

    // Profile & conversations state
    const [chatProfile, setChatProfile] = useState(undefined); // undefined = loading, null = not set up
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);

    // Socket ref
    const socketRef = useRef(null);

    // ── Fetch my ChatProfile on mount ─────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        api.getMyProfile()
            .then(profile => setChatProfile(profile))   // null if not set up yet
            .catch(() => setChatProfile(null));
    }, [user]);

    // ── Load conversations once profile is ready ───────────────────────────────
    useEffect(() => {
        if (!chatProfile?.chat_username) return;
        loadConversations();
        initSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('cm:leave', chatProfile.chat_username);
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [chatProfile?.chat_username]);

    const initSocket = () => {
        if (socketRef.current) return; // already connected

        const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : window.location.origin);

        const token = user?.role === 'employer'
            ? localStorage.getItem('recruiterToken')
            : localStorage.getItem('seekerToken');

        if (!token) {
            console.warn('[CM] Skipping socket init: No auth token found');
            return;
        }

        console.log('[CM] Connecting to socket at:', socketUrl);
        const socket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true
        });

        socket.on('connect', () => {
            console.log('[CM] Socket connected:', socket.id);
            // Register into room named by chat_username
            socket.emit('cm:register', chatProfile.chat_username);
        });

        socket.on('cm:receiveMessage', ({ conversationId, message }) => {
            console.log('[CM] Incoming message:', message);

            // ⚠️  Ignore messages we sent ourselves — already added optimistically
            if (message.sender === chatProfile.chat_username) return;

            // Bump the conversation to the top with the new lastMessage
            setConversations(prev => {
                const idx = prev.findIndex(c => c._id === conversationId);
                if (idx === -1) return prev;
                const updated = [...prev];
                const convo = { ...updated[idx], lastMessage: { content: message.content, sender: message.sender, timestamp: message.createdAt } };
                updated.splice(idx, 1);
                return [convo, ...updated];
            });

            // Append to messages if the conversation is currently active
            setActiveConversation(curr => {
                if (curr?._id === conversationId) {
                    setMessages(prev => [...prev, message]);
                    api.markSeen(conversationId).catch(() => { });
                }
                return curr;
            });
        });

        socket.on('connect_error', err => console.error('[CM] Socket error:', err.message));
        socketRef.current = socket;
    };

    const loadConversations = useCallback(async () => {
        try {
            const list = await api.getConversations();
            setConversations(Array.isArray(list) ? list : []);
        } catch { /* silent */ }
    }, []);

    const openConversation = useCallback(async (convo) => {
        setActiveConversation(convo);
        setLoadingMsgs(true);
        try {
            const msgs = await api.getMessages(convo._id);
            setMessages(Array.isArray(msgs) ? msgs : []);
            await api.markSeen(convo._id);
        } catch { setMessages([]); } finally { setLoadingMsgs(false); }
    }, []);

    const startChat = useCallback(async (target_username) => {
        const res = await api.startConversation(target_username);
        const convo = res?.conversation;
        if (!convo) throw new Error('Failed to start conversation');
        setConversations(prev => prev.find(c => c._id === convo._id) ? prev : [convo, ...prev]);
        await openConversation(convo);
        return convo;
    }, [openConversation]);

    const sendMsg = useCallback(async (content) => {
        if (!activeConversation || !content.trim()) return;
        const tempId = `temp_${Date.now()}`;
        const optimistic = {
            _id: tempId,
            conversationId: activeConversation._id,
            sender: chatProfile.chat_username,
            content: content.trim(),
            read: false,
            createdAt: new Date().toISOString()
        };

        // Optimistic add
        setMessages(prev => [...prev, optimistic]);

        // Update conversation preview
        setConversations(prev => {
            const idx = prev.findIndex(c => c._id === activeConversation._id);
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = { ...updated[idx], lastMessage: { content: content.trim(), sender: chatProfile.chat_username, timestamp: new Date() } };
            updated.splice(0, 0, ...updated.splice(idx, 1)); // move to top
            return updated;
        });

        try {
            const saved = await api.sendMessage(activeConversation._id, content.trim());
            // Replace optimistic message with server message
            setMessages(prev => prev.map(m => m._id === tempId ? saved : m));
        } catch {
            // Revert on failure
            setMessages(prev => prev.filter(m => m._id !== tempId));
        }
    }, [activeConversation, chatProfile]);

    const setupProfile = useCallback(async (chat_username, displayName) => {
        const profile = await api.setupUsername(chat_username, displayName);
        setChatProfile(profile);
        return profile;
    }, []);

    return (
        <ChatModuleContext.Provider value={{
            chatProfile, setChatProfile,
            conversations, setConversations,
            activeConversation, setActiveConversation,
            messages, loadingMsgs,
            openConversation, startChat, sendMsg, setupProfile, loadConversations
        }}>
            {children}
        </ChatModuleContext.Provider>
    );
};

export default ChatModuleProvider;
