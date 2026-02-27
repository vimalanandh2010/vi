import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { io } from 'socket.io-client';
import { Search, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CHAT_API = `/chat`; // Explicitly pointing to the new User ID based module

const ChatPage = () => {
    const { user } = useAuth(); // Rely purely on standard auth contextual User_ID

    const [conversations, setConversations] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [msgText, setMsgText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [handleInput, setHandleInput] = useState('');

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Bootstrap Initial Load
    useEffect(() => {
        if (user && user._id) {
            fetchConversations();

            // Connect socket explicitly using User_ID
            try {
                const socketUrl = API_URL.replace('/api', '');
                const socket = io(socketUrl);

                socket.on('connect', () => {
                    socket.emit('joinPrivateChat', user._id);
                });

                socket.on('receivePrivateMessage', ({ conversationId, message }) => {
                    setMessages(prev => {
                        // Only add message to active view if it matches the current conversation
                        if (activeConvo && activeConvo._id === conversationId) {
                            return [...prev, message];
                        }
                        return prev;
                    });
                    fetchConversations(); // Always refresh list on new message to update 'lastMessage'
                });

                socketRef.current = socket;

                // Cleanup on unmount
                return () => socket.disconnect();
            } catch (err) {
                console.error("Socket connection failed:", err);
            }
        }
    }, [user, activeConvo]);

    // Auto-Scroll to bottom whenever messages update
    useEffect(() => {
        try {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) { }
    }, [messages]);

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            const res = await axiosClient.get(`${CHAT_API}/conversations`);
            setConversations(res.data || []);
        } catch (err) {
            console.error("Failed to load conversations:", err);
            toast.error("Could not load chat history");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length > 2) {
            try {
                const res = await axiosClient.get(`${CHAT_API}/search?q=${val}`);
                setSearchResults(res.data || []);
            } catch (err) {
                console.error("Search failed:", err);
            }
        } else {
            setSearchResults([]);
        }
    };

    const startChat = async (targetUserId) => {
        try {
            const res = await axiosClient.post(`${CHAT_API}/conversations/start`, { targetUserId });
            if (res.data?.conversation) {
                selectConversation(res.data.conversation);
            }
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            console.error("Start chat failed:", err);
            toast.error("Failed to start chat");
        }
    };

    const selectConversation = async (convo) => {
        try {
            if (!convo) return;
            setActiveConvo(convo);
            setIsLoading(true);
            const res = await axiosClient.get(`${CHAT_API}/conversations/${convo._id}/messages`);
            setMessages(res.data || []);
        } catch (err) {
            console.error("Fetch messages failed:", err);
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!msgText.trim() || !activeConvo) return;

        try {
            const res = await axiosClient.post(`${CHAT_API}/conversations/${activeConvo._id}/messages`, { text: msgText });
            setMessages(prev => [...prev, res.data]);
            setMsgText('');
            fetchConversations(); // Trigger sidebar update
        } catch (err) {
            console.error("Send message failed:", err);
            toast.error("Failed to send message");
        }
    };

    // Edge case un-loaded user state
    if (!user || (isLoading && !profile)) {
        return <div className="flex h-screen items-center justify-center font-bold text-gray-500 bg-[#0B1120]">Loading profile...</div>;
    }

    const handleSetup = async (e) => {
        e.preventDefault();
        if (!handleInput.trim()) return;
        try {
            const res = await axiosClient.post(`${CHAT_API}/register-handle`, { chat_username: handleInput });
            setProfile(res.data);
            initializeChat(res.data);
            toast.success('Successfully registered @' + res.data.chat_username);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error registering handle');
        }
    };

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-[#0B1120] text-white">
                <form onSubmit={handleSetup} className="bg-[#1e293b] p-8 rounded-xl shadow-lg w-96 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">Setup Community Hub</h2>
                    <p className="text-gray-400 text-sm mb-6">Choose an `@username` to chat and post.</p>
                    <input
                        type="text" placeholder="e.g. johndoe" pattern="^[a-zA-Z0-9_]{3,24}$" required
                        className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-3 mb-4 outline-none focus:ring-1 focus:ring-purple-500 placeholder-gray-500"
                        value={handleInput} onChange={(e) => setHandleInput(e.target.value)}
                    />
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-bold transition-colors">Create ID</button>
                </form>
            </div>
        );
    }

    // Instagram-style layout
    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#0B1120] text-gray-100 border-t border-gray-800 font-sans">

            {/* LEFT SIDEBAR: Search & Thread List */}
            <div className="w-80 lg:w-96 border-r border-[#1e293b] flex flex-col bg-[#0B1120] shrink-0">
                <div className="p-4 border-b border-[#1e293b]">
                    <h2 className="font-bold text-xl mb-4 text-white px-1">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search names or emails..."
                            className="w-full bg-[#1e293b] border-none rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:ring-1 focus:ring-purple-500 transition-shadow text-white placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {searchResults.length > 0 ? (
                        <div className="p-2">
                            <p className="text-xs font-bold text-gray-400 px-3 mb-2 uppercase tracking-wide">Users Found</p>
                            {searchResults.map(u => (
                                <button
                                    key={u._id}
                                    onClick={() => startChat(u._id)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-[#1e293b] rounded-lg text-left transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-900 border border-purple-700 flex items-center justify-center shrink-0 overflow-hidden">
                                        {u.profilePic ? (
                                            <img src={u.profilePic} alt={u.firstName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-purple-300 font-bold text-lg">{u.firstName?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-gray-100 truncate">{u.firstName} {u.lastName}</div>
                                        <div className="text-xs font-medium text-gray-400 capitalize">{u.role}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-2">
                            {isLoading && !activeConvo ? (
                                <div className="p-4 text-center text-gray-500 text-sm font-medium">Loading messages...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-4 text-center text-gray-400 text-sm">No active conversations. Search to start one.</div>
                            ) : (
                                conversations.map(convo => {
                                    // Identify the remote target from the participants array based on User IDs
                                    const targetUser = convo.participants?.find(p => p._id !== user._id);
                                    if (!targetUser) return null; // Safe guard against null participants

                                    const isActive = activeConvo?._id === convo._id;

                                    return (
                                        <button
                                            key={convo._id}
                                            onClick={() => selectConversation(convo)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${isActive ? 'bg-[#1e293b]' : 'hover:bg-[#1e293b]'}`}
                                        >
                                            <div className="w-14 h-14 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                                                {targetUser.profilePic ? (
                                                    <img src={targetUser.profilePic} alt={targetUser.firstName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-400 font-semibold text-xl">{targetUser.firstName?.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 ml-1">
                                                <div className={`text-sm truncate ${isActive ? 'font-bold text-white' : 'font-semibold text-gray-200'}`}>
                                                    {targetUser.firstName} {targetUser.lastName}
                                                </div>
                                                <div className={`text-xs truncate mt-0.5 ${isActive ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                                                    {convo.lastMessage?.sender === user._id ? 'You: ' : ''}
                                                    {convo.lastMessage?.text || 'Tap to chat'}
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

            {/* RIGHT PANEL: Chat Window */}
            <div className="flex-1 flex flex-col bg-[#0B1120]">
                {activeConvo ? (
                    <>
                        {/* Header: Name and Role of person being messaged */}
                        <div className="h-16 px-6 border-b border-[#1e293b] flex items-center bg-[#0B1120] shrink-0 z-10 shadow-sm">
                            {(() => {
                                const targetUser = activeConvo.participants?.find(p => p._id !== user._id);
                                return targetUser ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center font-bold text-gray-400 shrink-0">
                                            {targetUser.profilePic ? (
                                                <img src={targetUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                targetUser.firstName?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white tracking-tight leading-tight">
                                                {targetUser.firstName} {targetUser.lastName}
                                            </div>
                                            <div className="text-xs text-gray-400 capitalize font-medium">
                                                {targetUser.role}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="font-bold text-white">Unknown User</div>
                                );
                            })()}
                        </div>

                        {/* Message Stream */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#0B1120]">
                            {isLoading && messages.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm py-4">Loading messages...</div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm py-4 font-medium">No messages yet. Send a hi!</div>
                            ) : (
                                messages.map((m, i) => {
                                    // Purple for Sent, Grey for Received
                                    const isMe = m.sender === user._id;
                                    return (
                                        <div key={m._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] px-4 py-2.5 text-[15px] shadow-sm ${isMe
                                                ? 'bg-purple-600 text-white rounded-2xl rounded-br-sm'
                                                : 'bg-[#1e293b] border border-gray-700 text-gray-100 rounded-2xl rounded-bl-sm'
                                                }`}>
                                                {m.text}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Box */}
                        <div className="p-4 bg-[#0B1120] shrink-0 mt-auto">
                            <form onSubmit={sendMessage} className="flex items-center gap-2 border border-[#1e293b] rounded-full px-2 py-1.5 focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-purple-500 bg-[#1e293b] transition-shadow">
                                <input
                                    type="text"
                                    placeholder="Message..."
                                    className="flex-1 bg-transparent border-none px-4 py-1.5 outline-none text-sm text-gray-100 placeholder-gray-400"
                                    value={msgText}
                                    onChange={(e) => setMsgText(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!msgText.trim()}
                                    className="p-2 text-purple-600 hover:text-purple-700 disabled:text-purple-300 font-semibold transition-colors pr-3"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    /* Default Empty Screen */
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                        <div className="w-24 h-24 rounded-full border-2 border-gray-600 flex items-center justify-center mb-4">
                            <MessageCircle size={44} className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-light tracking-wide">Your Messages</h3>
                        <p className="text-sm font-medium text-gray-500 mt-2">Send private direct messages dynamically.</p>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-4 rounded text-sm mt-4 shadow-sm transition-colors cursor-default border-none">
                            Select a chat or Search to Start
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
