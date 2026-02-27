import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { io } from 'socket.io-client';
import { Search, Send, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Using exact full backend URL logic as requested
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CHAT_API = `/chat`;

const ChatPage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [messages, setMessages] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [msgText, setMsgText] = useState('');
    const [handleInput, setHandleInput] = useState('');

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Initial Load - Check Profile
    useEffect(() => {
        if (!user) return;
        axiosClient.get(`${CHAT_API}/me`)
            .then(res => setProfile(res.data))
            .catch(() => setProfile(null));
    }, [user]);

    // Socket Initialization & Data Fetching (runs when profile exists)
    useEffect(() => {
        if (profile?.chat_username) {
            fetchConversations();

            // Connect to Socket.io
            const socketUrl = API_URL.replace('/api', '');
            const socket = io(socketUrl);
            socket.on('connect', () => {
                socket.emit('joinChat', profile.chat_username);
            });

            socket.on('receiveMessage', ({ conversationId, message }) => {
                setMessages(prev => {
                    // Only append if it belongs to the active conversation window
                    if (activeConvo && activeConvo._id === conversationId) {
                        return [...prev, message];
                    }
                    return prev;
                });
                // Update conversation list strictly on new messages
                fetchConversations();
            });

            socketRef.current = socket;
            return () => socket.disconnect();
        }
    }, [profile?.chat_username, activeConvo?._id]);

    // Auto-scroll hook
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await axiosClient.get(`${CHAT_API}/conversations`);
            setConversations(res.data);
        } catch (err) {
            console.error("Failed to load conversations");
        }
    };

    const handleSetup = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosClient.post(`${CHAT_API}/register-handle`, { chat_username: handleInput });
            setProfile(res.data);
            toast.success('Successfully registered @' + res.data.chat_username);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error registering handle');
        }
    };

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length > 2) {
            const res = await axiosClient.get(`${CHAT_API}/search?q=${val}`);
            setSearchResults(res.data);
        } else {
            setSearchResults([]);
        }
    };

    const startChat = async (target_username) => {
        try {
            const res = await axiosClient.post(`${CHAT_API}/conversations/start`, { target_username });
            selectConversation(res.data.conversation);
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            toast.error('Failed to start chat');
        }
    };

    const selectConversation = async (convo) => {
        setActiveConvo(convo);
        try {
            const res = await axiosClient.get(`${CHAT_API}/conversations/${convo._id}/messages`);
            setMessages(res.data);
        } catch (err) {
            toast.error("Failed to load messages");
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!msgText.trim() || !activeConvo) return;

        try {
            const res = await axiosClient.post(`${CHAT_API}/conversations/${activeConvo._id}/messages`, { content: msgText });
            setMessages(prev => [...prev, res.data]);
            setMsgText('');
            fetchConversations();
        } catch (err) {
            toast.error('Failed to send message');
        }
    };

    // UI: Registration Screen
    if (!profile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-900">
                <form onSubmit={handleSetup} className="bg-white p-8 rounded-xl shadow-lg w-96 border border-gray-100">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        Create Your Handle
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">Choose a unique `@username` to chat.</p>
                    <input
                        type="text"
                        placeholder="e.g. johndoe"
                        pattern="^[a-zA-Z0-9_]{3,24}$"
                        required
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-3 mb-4 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                    />
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-bold transition-colors">
                        Register Handle
                    </button>
                </form>
            </div>
        );
    }

    const recipientHandle = activeConvo?.participants.find(p => p !== profile.chat_username);

    // Instagram-style layout matching strict constraints
    return (
        <div className="flex h-screen bg-white text-gray-900 font-sans border-t border-gray-100">
            {/* LEFT SIDE: Search & Conversation List */}
            <div className="w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4 mt-2 px-2">
                        <div className="font-bold text-xl flex items-center gap-2 text-gray-900">
                            @{profile.chat_username}
                        </div>
                    </div>
                    <div className="relative px-2">
                        <Search className="absolute left-5 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find usernames..."
                            className="w-full bg-gray-100 border-transparent rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-gray-300"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Search Results Display */}
                    {searchResults.length > 0 ? (
                        <div className="p-2">
                            <p className="text-xs font-semibold text-gray-500 px-3 mb-2 uppercase tracking-wide">Search Results</p>
                            {searchResults.map(u => (
                                <button
                                    key={u._id}
                                    onClick={() => startChat(u.chat_username)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold border border-purple-200">
                                        {u.chat_username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate text-gray-900">{u.displayName || u.chat_username}</div>
                                        <div className="text-xs text-gray-500 truncate">@{u.chat_username}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        /* Conversation History Display */
                        <div className="p-2">
                            {conversations.length === 0 ? (
                                <div className="text-center py-10 px-4 text-gray-500 text-sm">
                                    No conversations yet. Search for a friend or recruiter to start talking.
                                </div>
                            ) : (
                                conversations.map(convo => {
                                    const otherUser = convo.participants.find(p => p !== profile.chat_username);
                                    const isActive = activeConvo?._id === convo._id;

                                    return (
                                        <button
                                            key={convo._id}
                                            onClick={() => selectConversation(convo)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                                    {otherUser?.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex-1 text-left min-w-0 ml-1">
                                                <div className={`text-sm truncate ${isActive ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                                                    {otherUser}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate mt-0.5">
                                                    {convo.lastMessage?.sender === profile.chat_username ? 'You: ' : ''}
                                                    {convo.lastMessage?.content || 'Started a chat'}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE: Message Window */}
            <div className="flex-1 flex flex-col bg-white">
                {activeConvo ? (
                    <>
                        {/* Header showing recipient's @username */}
                        <div className="h-16 px-6 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                    {recipientHandle?.charAt(0).toUpperCase()}
                                </div>
                                <div className="font-bold text-gray-900 tracking-tight">
                                    @{recipientHandle}
                                </div>
                            </div>
                        </div>

                        {/* Messages Area (Purple for me, Grey for them) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-white">
                            {messages.map((m, i) => {
                                const isMe = m.sender === profile.chat_username;
                                return (
                                    <div key={m._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2 text-sm shadow-sm ${isMe
                                            ? 'bg-purple-600 text-white rounded-2xl rounded-br-sm'
                                            : 'bg-[#EFEFEF] border border-gray-200 text-gray-900 rounded-2xl rounded-bl-sm'
                                            }`}>
                                            {m.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Form */}
                        <div className="p-4 bg-white border-none shrink-0 m-4 border border-gray-200 rounded-full px-2 flex items-center focus-within:ring-1 focus-within:ring-gray-300">
                            <form onSubmit={sendMessage} className="flex-1 flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Message..."
                                    className="flex-1 bg-transparent border-none px-4 py-2 outline-none text-sm text-gray-900 placeholder-gray-500"
                                    value={msgText}
                                    onChange={(e) => setMsgText(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!msgText.trim()}
                                    className="p-2 text-purple-600 hover:text-purple-700 disabled:text-purple-300 transition-colors font-semibold pr-4 text-sm"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col gap-4">
                        <div className="w-24 h-24 rounded-full border-2 border-gray-900 flex items-center justify-center mt-[-10vh]">
                            <Send size={44} className="text-gray-900 ml-1" />
                        </div>
                        <p className="text-xl font-light text-gray-900 tracking-wider">Your Messages</p>
                        <p className="text-sm font-medium text-gray-500">Send private photos and messages to a friend or group.</p>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-1.5 px-4 rounded mt-2 transition-colors">
                            Send Message
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
