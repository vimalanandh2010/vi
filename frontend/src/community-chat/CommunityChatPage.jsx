import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Search, Send, User, MessageSquare, Users, PlusCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CHAT_API = `/community-chat`;

const CommunityChatPage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [viewMode, setViewMode] = useState('chats'); // 'chats' or 'communities'

    // Lists
    const [conversations, setConversations] = useState([]);
    const [communities, setCommunities] = useState([]);

    // Active Views
    const [activeConvo, setActiveConvo] = useState(null);
    const [activeCommunity, setActiveCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const [msgText, setMsgText] = useState('');
    const [handleInput, setHandleInput] = useState('');

    // Recruiter Specific
    const [stats, setStats] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCommTitle, setNewCommTitle] = useState('');
    const [newCommDesc, setNewCommDesc] = useState('');

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Initial Load - Check Profile
    useEffect(() => {
        if (!user) return;
        fetchInitialData();
    }, [user]);

    const fetchInitialData = async () => {
        try {
            const profileRes = await axiosClient.get(`${CHAT_API}/me`);
            if (profileRes?.data) {
                setProfile(profileRes.data);
                const commRes = await axiosClient.get(`${CHAT_API}/community`);
                setCommunities(commRes.data);
                fetchConversations();
            }

            // Recruiter Tracking requirement
            if (user.role === 'recruiter' || user.role === 'employer') {
                const statRes = await axiosClient.get(`${CHAT_API}/recruiter-stats`);
                setStats(statRes.data.totalCommunitiesCreated || 0);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await axiosClient.get(`${CHAT_API}/conversations`);
            setConversations(res.data);
        } catch (err) {
            console.error("Failed to load conversations");
        }
    };

    // Socket Initialization
    useEffect(() => {
        if (profile?.chat_username) {
            const socketUrl = import.meta.env.VITE_SOCKET_URL || API_URL.replace('/api', '');
            const socket = io(socketUrl);

            socket.on('connect', () => {
                socket.emit('joinPrivateChat', profile.chat_username);
                // Also join all community rooms immediately so we get updates for any community
                communities.forEach(c => socket.emit('joinCommunity', c._id));
            });

            socket.on('receivePrivateMessage', ({ conversationId, message }) => {
                setMessages(prev => {
                    if (activeConvo && activeConvo._id === conversationId) return [...prev, message];
                    return prev;
                });
                fetchConversations();
            });

            socket.on('newCommunityComment', ({ communityId, comment }) => {
                // If we are looking at this active community, append comment
                if (activeCommunity && activeCommunity._id === communityId) {
                    setActiveCommunity(prev => ({
                        ...prev,
                        comments: [...prev.comments, comment]
                    }));
                }
            });

            socketRef.current = socket;
            return () => socket.disconnect();
        }
    }, [profile?.chat_username, activeConvo, activeCommunity, communities]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeCommunity?.comments]);

    const handleSetup = async (e) => {
        e.preventDefault();
        if (!handleInput.trim()) return;
        try {
            const res = await axiosClient.post(`${CHAT_API}/register-handle`, { chat_username: handleInput });
            setProfile(res.data);
            toast.success('Successfully registered @' + res.data.chat_username);

            const commRes = await axiosClient.get(`${CHAT_API}/community`);
            if (commRes?.data) {
                setCommunities(commRes.data);
            }
            fetchConversations();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error registering handle');
        }
    };

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length > 2) {
            const res = await axiosClient.get(`${CHAT_API}/search-users?q=${val}`);
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
            setViewMode('chats');
        } catch (err) {
            toast.error('Failed to start chat');
        }
    };

    const selectConversation = async (convo) => {
        setActiveConvo(convo);
        setActiveCommunity(null); // Clear community view
        try {
            const res = await axiosClient.get(`${CHAT_API}/conversations/${convo._id}/messages`);
            setMessages(res.data);
        } catch (err) {
            toast.error("Failed to load messages");
        }
    };

    const selectCommunity = (comm) => {
        setActiveCommunity(comm);
        setActiveConvo(null); // Clear chat view
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!msgText.trim()) return;

        if (activeConvo) {
            try {
                const res = await axiosClient.post(`${CHAT_API}/conversations/${activeConvo._id}/messages`, { content: msgText });
                setMessages(prev => [...prev, res.data]);
                setMsgText('');
                fetchConversations();
            } catch (err) { toast.error('Failed to send message'); }
        } else if (activeCommunity) {
            try {
                await axiosClient.post(`${CHAT_API}/community/${activeCommunity._id}/comment`, { content: msgText });
                setMsgText('');
            } catch (err) { toast.error('Failed to post comment'); }
        }
    };

    const createCommunity = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosClient.post(`${CHAT_API}/community`, { title: newCommTitle, description: newCommDesc });
            setCommunities([res.data, ...communities]);
            setShowCreateModal(false);
            setNewCommTitle('');
            setNewCommDesc('');
            toast.success('Community Created!');

            // Recalculate stats since we just created one
            const statRes = await axiosClient.get(`${CHAT_API}/recruiter-stats`);
            setStats(statRes.data.totalCommunitiesCreated || 0);

            // Join socket room
            if (socketRef.current) socketRef.current.emit('joinCommunity', res.data._id);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating community');
        }
    };


    if (!profile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-900">
                <form onSubmit={handleSetup} className="bg-white p-8 rounded-xl shadow-lg w-96 border border-gray-100">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">Setup Community Hub</h2>
                    <p className="text-gray-500 text-sm mb-6">Choose an `@username` to chat and post.</p>
                    <input
                        type="text" placeholder="e.g. johndoe" pattern="^[a-zA-Z0-9_]{3,24}$" required
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-3 mb-4 outline-none focus:ring-1 focus:ring-purple-500"
                        value={handleInput} onChange={(e) => setHandleInput(e.target.value)}
                    />
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-bold">Register</button>
                </form>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white text-gray-900 font-sans border-t border-gray-100">
            {/* Split Pane: LEFT SIDE */}
            <div className="w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4 mt-2 px-2">
                        <div className="font-bold text-xl flex items-center gap-2">@{profile.chat_username}</div>
                        {(user?.role === 'recruiter' || user?.role === 'employer') && (
                            <div className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded">
                                Created: {stats}
                            </div>
                        )}
                    </div>

                    {/* View Switcher */}
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-4 bg-gray-50 p-1">
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'chats' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
                            onClick={() => setViewMode('chats')}
                        >
                            Messages
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'communities' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
                            onClick={() => setViewMode('communities')}
                        >
                            Communities
                        </button>
                    </div>

                    {viewMode === 'chats' && (
                        <div className="relative px-1">
                            <Search className="absolute left-4 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text" placeholder="Find usernames to chat..."
                                className="w-full bg-gray-100 border-transparent rounded-lg py-2 pl-10 pr-4 text-sm outline-none"
                                value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* CHATS VIEW */}
                    {viewMode === 'chats' && (
                        searchResults.length > 0 ? (
                            <div className="p-2">
                                <p className="text-xs font-semibold text-gray-500 px-3 mb-2 uppercase tracking-wide">Search Results</p>
                                {searchResults.map(u => (
                                    <button
                                        key={u._id} onClick={() => startChat(u.chat_username)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold border border-purple-200">
                                            {u.chat_username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="font-bold text-sm text-gray-900">{u.displayName || u.chat_username}</div>
                                            <div className="text-xs text-gray-500">@{u.chat_username}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-2">
                                {conversations.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500">No private messages</div>
                                ) : (
                                    conversations.map(convo => {
                                        const otherUser = convo.participants.find(p => p !== profile.chat_username);
                                        return (
                                            <button
                                                key={convo._id} onClick={() => selectConversation(convo)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeConvo?._id === convo._id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium shrink-0">
                                                    {otherUser?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className={`text-sm truncate ${activeConvo?._id === convo._id ? 'font-bold' : 'font-semibold'}`}>{otherUser}</div>
                                                    <div className="text-xs text-gray-500 truncate mt-0.5">{convo.lastMessage?.content}</div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )
                    )}

                    {/* COMMUNITIES VIEW */}
                    {viewMode === 'communities' && (
                        <div className="p-2">
                            {(user?.role === 'recruiter' || user?.role === 'employer') && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="w-full mb-3 flex items-center justify-center gap-2 bg-purple-50 text-purple-600 hover:bg-purple-100 p-3 rounded-lg font-bold border border-purple-200 text-sm transition-colors"
                                >
                                    <PlusCircle size={18} /> Create Community
                                </button>
                            )}

                            {communities.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 text-sm">No communities joined</div>
                            ) : (
                                communities.map((comm) => (
                                    <button
                                        key={comm._id} onClick={() => selectCommunity(comm)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border border-transparent shadow-sm mb-2 ${activeCommunity?._id === comm._id ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <div className="w-12 h-12 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">
                                            <Users size={20} />
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="text-sm font-bold text-gray-900 truncate">{comm.title}</div>
                                            <div className="text-xs text-gray-500 truncate mt-0.5">{comm.description}</div>
                                            <div className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">{comm.comments?.length || 0} Comments</div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Split Pane: RIGHT SIDE */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {activeConvo ? (
                    /* PRIVATE CHAT BUBBLES */
                    <>
                        <div className="h-16 px-6 border-b border-gray-200 flex justify-between items-center bg-white shrink-0 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="font-bold text-gray-900">@{activeConvo.participants.find(p => p !== profile.chat_username)}</div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            {messages.map((m, i) => {
                                const isMe = m.sender === profile.chat_username;
                                return (
                                    <div key={m._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-2xl rounded-br-sm' : 'bg-white border text-gray-900 rounded-2xl rounded-bl-sm'
                                            }`}>
                                            {m.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </>
                ) : activeCommunity ? (
                    /* COMMUNITY FEED */
                    <>
                        <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900">{activeCommunity.title}</h2>
                            <p className="text-sm text-gray-500 mt-1">{activeCommunity.description}</p>
                            <p className="text-xs font-semibold text-purple-600 mt-2 uppercase tracking-wide">Creator: {activeCommunity.createdBy?.firstName || 'Recruiter'}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {(!activeCommunity.comments || activeCommunity.comments.length === 0) ? (
                                <div className="text-center py-10 text-gray-400 font-medium">Be the first to comment in this community!</div>
                            ) : (
                                activeCommunity.comments.map((c, i) => (
                                    <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm text-gray-900">{c.displayName}</span>
                                            <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.content}</p>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </>
                ) : (
                    /* EMPTY STATE */
                    <div className="flex-1 flex items-center justify-center flex-col gap-4 bg-white">
                        <div className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center">
                            <MessageSquare size={44} className="text-purple-600" />
                        </div>
                        <p className="text-xl font-medium text-gray-900">Your Hub</p>
                        <p className="text-sm text-gray-500">Select a private chat or a community to start communicating.</p>
                    </div>
                )}

                {/* Unified Input Box */}
                {(activeConvo || activeCommunity) && (
                    <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex items-center shadow-sm">
                        <form onSubmit={sendMessage} className="flex-1 flex items-center gap-2 border border-gray-200 rounded-full px-2 py-1 bg-gray-50 focus-within:bg-white focus-within:border-purple-300 focus-within:ring-1 focus-within:ring-purple-300">
                            <input
                                type="text" placeholder={activeCommunity ? `Comment in ${activeCommunity.title}...` : "Send a message..."}
                                className="flex-1 bg-transparent border-none px-4 py-2 outline-none text-sm"
                                value={msgText} onChange={(e) => setMsgText(e.target.value)}
                            />
                            <button type="submit" disabled={!msgText.trim()} className="p-2 text-purple-600 disabled:text-gray-300 hover:text-purple-800 pr-3 transition-colors">
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Modal: Create Community */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Create New Community</h3>
                        <form onSubmit={createCommunity}>
                            <input type="text" placeholder="Community Title" required
                                className="w-full bg-gray-50 border border-gray-200 rounded p-3 mb-3 outline-none focus:ring-1 focus:ring-purple-500"
                                value={newCommTitle} onChange={(e) => setNewCommTitle(e.target.value)} />
                            <textarea placeholder="Description" required rows="3"
                                className="w-full bg-gray-50 border border-gray-200 rounded p-3 mb-4 outline-none resize-none focus:ring-1 focus:ring-purple-500"
                                value={newCommDesc} onChange={(e) => setNewCommDesc(e.target.value)} />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityChatPage;
