import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, AtSign, User, Circle } from 'lucide-react';
import { useSocialChat } from './SocialChatContext';
import * as api from './ChatApi';
import { toast } from 'react-toastify';

const ChatPage = () => {
    const { profile, setProfile, conversations, activeConvo, messages, onlineUsers, sendMessage, selectConversation } = useSocialChat();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [msgText, setMsgText] = useState('');
    const [handleInput, setHandleInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSetup = async (e) => {
        e.preventDefault();
        try {
            const res = await api.setupProfile({ chat_handle: handleInput });
            setProfile(res.data);
            toast.success('Profile setup complete!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error setting up profile');
        }
    };

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length > 2) {
            const res = await api.searchUsers(val);
            setSearchResults(res.data);
        } else {
            setSearchResults([]);
        }
    };

    const startChat = async (handle) => {
        try {
            const res = await api.startConversation(handle);
            selectConversation(res.data);
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            toast.error('Error starting chat');
        }
    };

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <form onSubmit={handleSetup} className="bg-gray-800 p-8 rounded-xl shadow-2xl w-96">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <AtSign className="text-purple-500" /> Create Your Handle
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">Choose a unique handle to start chatting.</p>
                    <input
                        type="text"
                        placeholder="@username"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 mb-4 outline-none focus:border-purple-500"
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                    />
                    <button className="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded-lg font-bold transition-colors">
                        Confirm Handle
                    </button>
                </form>
            </div>
        );
    }

    const otherHandle = activeConvo?.participants.find(p => p !== profile.chat_handle);

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center gap-2 mb-4 text-purple-400 font-bold">
                        <AtSign size={20} /> {profile.chat_handle}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search handles..."
                            className="w-full bg-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-purple-500"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {searchResults.length > 0 ? (
                        <div className="p-2">
                            <p className="text-xs text-gray-500 px-2 mb-2">SEARCH RESULTS</p>
                            {searchResults.map(u => (
                                <button
                                    key={u._id}
                                    onClick={() => startChat(u.chat_handle)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                                        <User size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm">{u.displayName}</div>
                                        <div className="text-xs text-gray-400">{u.chat_handle}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-2">
                            {conversations.map(convo => {
                                const h = convo.participants.find(p => p !== profile.chat_handle);
                                const online = onlineUsers.has(h);
                                return (
                                    <button
                                        key={convo._id}
                                        onClick={() => selectConversation(convo)}
                                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors ${activeConvo?._id === convo._id ? 'bg-gray-800' : ''}`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                                <User size={24} />
                                            </div>
                                            {online && <Circle className="absolute bottom-0 right-0 text-green-500 fill-green-500" size={12} />}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="font-bold text-sm truncate">{h}</div>
                                            <div className="text-xs text-gray-400 truncate">{convo.lastMessage?.text || 'No messages yet'}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col bg-gray-950">
                {activeConvo ? (
                    <>
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                                    {otherHandle[1]?.toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold flex items-center gap-2">
                                        {otherHandle}
                                        {onlineUsers.has(otherHandle) && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {onlineUsers.has(otherHandle) ? 'Active now' : 'Offline'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(m => (
                                <div key={m._id} className={`flex ${m.sender_handle === profile.chat_handle ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl ${m.sender_handle === profile.chat_handle ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-100 rounded-bl-none'}`}>
                                        {m.message_text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); sendMessage(msgText); setMsgText(''); }} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
                            <input
                                type="text"
                                placeholder="Message..."
                                className="flex-1 bg-gray-800 border-none rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-purple-500"
                                value={msgText}
                                onChange={(e) => setMsgText(e.target.value)}
                            />
                            <button type="submit" className="p-2 text-purple-500 hover:bg-gray-800 rounded-full transition-colors">
                                <Send size={24} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                            <Send size={40} />
                        </div>
                        <p className="text-xl">Your Messages</p>
                        <p className="text-sm">Send a message to a friend or recruiter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
