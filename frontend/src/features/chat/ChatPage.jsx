import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';
import {
    Search, Send, MessageCircle, User, LogOut,
    Smile, Paperclip, X, FileText, Download, Check, CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Navbar from '../../components/Navbar';

const API_URL = ''; // Relative to axiosClient baseURL

const ChatPage = () => {
    const { user } = useAuth();
    const { socket, incomingMessage } = useChat();
    const location = useLocation();

    const [myProfile, setMyProfile] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [msgText, setMsgText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingProfile, setIsCheckingProfile] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    // Registration State
    const [showRegister, setShowRegister] = useState(false);
    const [regHandle, setRegHandle] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Bootstrap Chat
    useEffect(() => {
        if (user && user._id && !myProfile) {
            checkProfile();
        }
    }, [user, myProfile]);

    // Handle incoming messages from global context
    useEffect(() => {
        if (incomingMessage && incomingMessage.isPrivate) {
            const { conversationId, message } = incomingMessage;
            setMessages(prev => {
                if (activeConvo && activeConvo._id === conversationId) {
                    return [...prev, message];
                }
                return prev;
            });
            fetchConversations();
        }
    }, [incomingMessage]);

    const checkProfile = async () => {
        if (!user?._id || isCheckingProfile) return;
        try {
            setIsCheckingProfile(true);
            const res = await axiosClient.get('chat/me');
            if (res) {
                setMyProfile(res);
                setShowRegister(false);
                fetchConversations();
            } else {
                setShowRegister(true);
            }
        } catch (err) {
            console.error('Error checking profile:', err);
        } finally {
            setIsCheckingProfile(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!regHandle.trim()) return;

        try {
            setIsRegistering(true);
            const res = await axiosClient.post(`chat/register-handle`, { chat_username: regHandle });
            if (res) {
                setMyProfile(res);
                setShowRegister(false);
                fetchConversations();
                toast.success('Chat ID created!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register ID');
        } finally {
            setIsRegistering(false);
        }
    };

    // Handle URL ?targetId= query param (Message Now feature)
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const targetId = queryParams.get('targetId');
        if (targetId && user?._id && myProfile) {
            startChat(targetId);
        }
    }, [location.search, user, myProfile]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await axiosClient.get(`chat/conversations`);
            if (res) setConversations(res);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length > 2) {
            try {
                const res = await axiosClient.get(`chat/search?q=${val}`);
                if (res) setSearchResults(res);
            } catch (err) {
                console.error('Search error:', err);
            }
        } else {
            setSearchResults([]);
        }
    };

    const startChat = async (targetUserId) => {
        if (targetUserId === user._id) return;
        try {
            const res = await axiosClient.post(`chat/conversations/start`, { targetUserId });
            if (res?.conversation) {
                selectConversation(res.conversation);
            }
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            toast.error('Failed to start chat');
        }
    };

    const selectConversation = async (convo) => {
        try {
            setActiveConvo(convo);
            setIsLoading(true);
            const res = await axiosClient.get(`chat/conversations/${convo._id}/messages`);
            if (res) setMessages(res);
        } catch (err) {
            toast.error('Failed to load messages');
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!msgText.trim() && !selectedFile) return;

        const formData = new FormData();
        if (msgText.trim()) formData.append('text', msgText);
        if (selectedFile) formData.append('file', selectedFile);

        try {
            const res = await axiosClient.post(`chat/conversations/${activeConvo._id}/messages`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res) {
                setMessages(prev => [...prev, res]);
                setMsgText('');
                setSelectedFile(null);
                setFilePreview(null);
                setShowEmojiPicker(false);
                fetchConversations(); // Sidebar update
            }
        } catch (err) {
            toast.error('Failed to send message');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                setFilePreview(URL.createObjectURL(file));
            } else {
                setFilePreview({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
            }
        }
    };

    const onEmojiClick = (emojiObject) => {
        setMsgText(prev => prev + emojiObject.emoji);
    };

    // Loading State
    if (isCheckingProfile) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#0B1120] text-gray-400">
                <p className="animate-pulse font-medium text-sm">Loading...</p>
            </div>
        );
    }

    // REGISTRATION UI (Portal Style)
    if (showRegister) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#0B1120] px-4">
                <div className="w-full max-w-[350px] text-center bg-[#1e293b] p-8 rounded-2xl border border-slate-700/50 shadow-xl">
                    <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                        <MessageCircle size={36} className="text-blue-500" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to Chat</h2>
                    <p className="text-gray-400 text-sm mb-8">Create a unique handle to start connecting with employers and peers.</p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Choose a username"
                                value={regHandle}
                                onChange={(e) => setRegHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="w-full bg-[#0B1120] border border-slate-700 rounded-lg text-sm py-3 px-4 text-white outline-none focus:border-blue-500 transition-colors"
                                required
                                minLength={3}
                                maxLength={24}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isRegistering || regHandle.length < 3}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                        >
                            {isRegistering ? 'Creating...' : 'Get Started'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#0B1120]">
            <Navbar />
            <div className="flex flex-1 h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] text-white font-sans border-t border-slate-800/60 overflow-hidden">
                {/* Sidebar */}
                <div className="w-[350px] border-r border-slate-800/60 flex flex-col bg-[#0B1120]">
                    <div className="pt-6 pb-2 px-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <h2 className="text-xl font-bold tracking-tight text-white">
                                    {myProfile?.chat_username || 'Messages'}
                                </h2>
                                <svg aria-label="Down chevron icon" fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12"><path d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z" transform="rotate(180 12 12)"></path></svg>
                            </div>
                            <button className="text-white hover:opacity-70 transition-opacity">
                                <svg aria-label="New message" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M12.202 3.203H5.75a2.503 2.503 0 0 0-2.5 2.5v12.5a2.503 2.503 0 0 0 2.5 2.5h12.5a2.503 2.503 0 0 0 2.5-2.5v-6.452a.336.336 0 0 0-.447-.312.335.335 0 0 0-.218.312v6.452a1.83 1.83 0 0 1-1.832 1.832H5.75a1.83 1.83 0 0 1-1.832-1.832V5.703a1.83 1.83 0 0 1 1.832-1.832h6.452l.068-.006a.336.336 0 0 0 .265-.326V3.203Zm9.664.123 1.157 1.157a1.59 1.59 0 0 1 0 2.247l-6.9 6.901a1.26 1.26 0 0 1-.502.327l-3.351 1.117a.4.4 0 0 1-.525-.526l1.117-3.35a1.26 1.26 0 0 1 .327-.503l6.901-6.902a1.59 1.59 0 0 1 2.247 0Zm-1.815 1.89-6.48 6.48a.591.591 0 0 0-.153.235l-.895 2.684 2.685-.895a.59.59 0 0 0 .235-.152l6.48-6.48-1.872-1.872Z"></path></svg>
                            </button>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-base text-gray-200">Messages</span>
                            <span className="text-gray-400 font-semibold text-sm cursor-pointer hover:text-white transition-colors">Requests</span>
                        </div>
                        <div className="relative mb-2 mt-2">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full bg-[#1e293b] rounded-lg py-2 pl-10 pr-4 text-sm outline-none text-white placeholder-gray-500 border border-slate-700/50 focus:border-blue-500 transition-colors"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {searchQuery.length > 2 && (
                            <div className="p-2 animate-in fade-in duration-300">
                                {searchResults.length > 0 ? (
                                    searchResults.map(u => (
                                        <button
                                            key={u._id}
                                            onClick={() => startChat(u._id)}
                                            className="w-full flex items-center gap-3 py-3 px-4 hover:bg-[#1e293b] transition-colors rounded-xl text-left group"
                                        >
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-slate-700 bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white text-lg">
                                                {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover" /> : u.firstName?.charAt(0).toUpperCase() || <User size={20} className="text-gray-400" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-white">{u.firstName} {u.lastName}</div>
                                                <div className="text-xs text-blue-400 mt-0.5">{u.role}</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="px-4 py-2 text-sm text-gray-500 text-center">No accounts found.</p>
                                )}
                            </div>
                        )}

                        {searchQuery.length <= 2 && (
                            <div className="space-y-1 mt-2 px-2">
                                {conversations.length === 0 && !isLoading && (
                                    <div className="text-center py-10 px-6">
                                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                                            <MessageCircle size={24} className="text-gray-500" />
                                        </div>
                                        <p className="text-gray-400 text-sm">No conversations yet.</p>
                                        <p className="text-gray-500 text-xs mt-1">Search for users to start chatting.</p>
                                    </div>
                                )}
                                {conversations.map(convo => {
                                    const target = convo.participants?.find(p => p._id !== user?._id);
                                    const isActive = activeConvo?._id === convo._id;
                                    if (!target) return null;
                                    return (
                                        <button
                                            key={convo._id}
                                            onClick={() => selectConversation(convo)}
                                            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 group ${isActive ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-[#1e293b] border border-transparent'}`}
                                        >
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-slate-700 bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white text-lg">
                                                {target.photoUrl ? <img src={target.photoUrl} className="w-full h-full object-cover" /> : target.firstName?.charAt(0).toUpperCase() || <User size={20} className="text-gray-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className={`text-sm font-semibold truncate ${isActive ? 'text-blue-400' : 'text-gray-200 group-hover:text-white'}`}>
                                                    {target.firstName} {target.lastName}
                                                </div>
                                                <div className={`text-xs truncate mt-0.5 ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {convo.lastMessage?.sender === user?._id && 'You: '}{convo.lastMessage?.text || 'Sent an attachment'}{' · '}{convo.lastMessage?.timestamp && new Date(convo.lastMessage.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-[#0B1120] relative">
                    {activeConvo ? (
                        <>
                            {/* Header */}
                            <div className="h-[75px] px-6 border-b border-slate-800/60 flex items-center justify-between bg-[#1e293b]/30 backdrop-blur-md z-10 w-full shrink-0">
                                {(() => {
                                    const target = activeConvo.participants?.find(p => p._id !== user?._id);
                                    return target ? (
                                        <div className="flex items-center gap-4 cursor-pointer">
                                            <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden border border-slate-700 bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white text-lg">
                                                {target.photoUrl ? <img src={target.photoUrl} className="w-full h-full object-cover" /> : target.firstName?.charAt(0).toUpperCase() || <User size={20} className="text-gray-400" />}
                                            </div>
                                            <div className="leading-tight">
                                                <div className="font-semibold text-white text-base">{target.firstName} {target.lastName}</div>
                                                <div className="text-xs text-green-400 font-medium flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    Active
                                                </div>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}

                            </div>

                            {/* Target Profile Summary */}
                            <div className="flex-1 overflow-y-auto px-5 py-6 bg-[#0B1120] custom-scrollbar flex flex-col">
                                {messages.length === 0 && activeConvo?.participants && (
                                    <div className="flex flex-col items-center justify-center mt-8 mb-12">
                                        <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden mb-4 border border-slate-700 bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white text-4xl">
                                            {activeConvo.participants.find(p => p._id !== user?._id)?.photoUrl ?
                                                <img src={activeConvo.participants.find(p => p._id !== user?._id)?.photoUrl} className="w-full h-full object-cover" />
                                                : activeConvo.participants.find(p => p._id !== user?._id)?.firstName?.charAt(0).toUpperCase() || <User size={40} className="text-gray-400" />
                                            }
                                        </div>
                                        <span className="text-xl font-bold text-white mb-1">
                                            {activeConvo.participants.find(p => p._id !== user?._id)?.firstName} {activeConvo.participants.find(p => p._id !== user?._id)?.lastName}
                                        </span>
                                        <span className="text-sm text-blue-400 mb-4 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                            Job Portal User · {activeConvo.participants.find(p => p._id !== user?._id)?.role}
                                        </span>
                                        <button className="bg-[#1e293b] hover:bg-slate-700 border border-slate-600 font-medium text-white px-5 py-2 rounded-xl text-sm transition-all shadow-lg">
                                            View Full Profile
                                        </button>
                                    </div>
                                )}

                                {messages.map((m, i) => {
                                    const isMe = m.sender === user?._id;
                                    const prevMsg = i > 0 ? messages[i - 1] : null;
                                    const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;

                                    const isFirstInGroup = !prevMsg || prevMsg.sender !== m.sender;
                                    const isLastInGroup = !nextMsg || nextMsg.sender !== m.sender;

                                    let borderRadiusClasses = "rounded-[20px]";
                                    if (isMe) {
                                        if (!isFirstInGroup) borderRadiusClasses += " rounded-tr-md";
                                        if (!isLastInGroup) borderRadiusClasses += " rounded-br-md";
                                    } else {
                                        if (!isFirstInGroup) borderRadiusClasses += " rounded-tl-md";
                                        if (!isLastInGroup) borderRadiusClasses += " rounded-bl-md";
                                    }

                                    return (
                                        <div key={m._id || i} className={`w-full flex ${isMe ? 'justify-end' : 'justify-start'} mb-[3px] first:mt-auto`}>
                                            {!isMe && isLastInGroup && (
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center self-end mr-3 shrink-0 overflow-hidden mb-[1px] border border-slate-700 bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white text-[12px]">
                                                    {activeConvo.participants.find(p => p._id === m.sender)?.photoUrl ? (
                                                        <img src={activeConvo.participants.find(p => p._id === m.sender)?.photoUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        activeConvo.participants.find(p => p._id === m.sender)?.firstName?.charAt(0).toUpperCase() || <User size={16} className="text-gray-400 m-auto mt-1.5" />
                                                    )}
                                                </div>
                                            )}
                                            {!isMe && !isLastInGroup && (
                                                <div className="w-8 mr-3 shrink-0"></div>
                                            )}

                                            <div className={`max-w-[70%] px-4 py-2.5 text-[15px] leading-relaxed group relative shadow-sm ${isMe ? 'bg-blue-600 text-white shadow-blue-900/20' : 'bg-[#1e293b] text-white shadow-black/20 border border-slate-700/50'} ${borderRadiusClasses} ${isLastInGroup ? 'mb-3' : ''}`}>
                                                {m.fileUrl && (
                                                    <div className="mb-2">
                                                        {m.fileType === 'image' ? (
                                                            <img src={m.fileUrl} alt="Attached" className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity border border-white/10" />
                                                        ) : (
                                                            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl hover:bg-black/20 transition-all border ${isMe ? 'bg-blue-700/50 border-blue-400/30' : 'bg-slate-800/80 border-slate-600/50'}`}>
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? 'bg-blue-500/50 text-white' : 'bg-slate-700 text-blue-400'}`}>
                                                                    <FileText size={20} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold truncate">Attachment</p>
                                                                </div>
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                                {m.text && <p className="break-words">{m.text}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-[#0B1120] border-t border-slate-800/60 flex-shrink-0">
                                {filePreview && (
                                    <div className="mb-3 bg-[#1e293b] p-2.5 rounded-xl flex items-center justify-between mx-4 max-w-sm border border-slate-700/50 shadow-lg">
                                        <div className="flex items-center gap-3">
                                            {typeof filePreview === 'string' ? (
                                                <img src={filePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-600" />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                                                    <FileText className="text-blue-400" size={20} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{typeof filePreview === 'string' ? 'Image selected' : filePreview.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Ready to send</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setSelectedFile(null); setFilePreview(null); }} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-gray-400 hover:text-red-400">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={sendMessage} className="flex flex-row items-center border border-slate-700 focus-within:border-blue-500 rounded-full min-h-[50px] px-2 bg-[#1e293b] shadow-inner relative transition-colors mx-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="p-1 text-white hover:opacity-70 transition-opacity"
                                    >
                                        <svg aria-label="Emoji" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z"></path></svg>
                                    </button>

                                    <div className="flex-1 relative mx-2 h-full py-[10px] flex items-center">
                                        <textarea
                                            value={msgText}
                                            onChange={(e) => setMsgText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
                                            placeholder="Type a message..."
                                            className="w-full bg-transparent border-none text-white outline-none placeholder-gray-500 text-sm resize-none self-center max-h-32 custom-scrollbar flex items-center h-[20px] leading-tight"
                                            style={{ display: 'block' }}
                                        />
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-12 left-0 z-50">
                                                <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width={300} height={400} />
                                            </div>
                                        )}
                                    </div>

                                    {(!msgText.trim() && !selectedFile) ? (
                                        <>
                                            <label className="p-2 cursor-pointer text-white hover:opacity-70 transition-opacity">
                                                <svg aria-label="Add photo or video" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M6.549 5.013h10.9A4.053 4.053 0 0 1 21.5 9.066v9.868a4.053 4.053 0 0 1-4.051 4.051H6.549A4.053 4.053 0 0 1 2.5 18.934V9.066A4.053 4.053 0 0 1 6.549 5.013Zm0 2A2.052 2.052 0 0 0 4.5 9.066v9.868A2.052 2.052 0 0 0 6.549 20.985h10.9A2.052 2.052 0 0 0 19.5 18.934V9.066A2.052 2.052 0 0 0 17.449 7.013ZM12 18.664a6.664 6.664 0 1 1 6.664-6.664A6.671 6.671 0 0 1 12 18.664Zm0-11.328a4.664 4.664 0 1 0 4.664 4.664A4.67 4.67 0 0 0 12 7.336Z"></path></svg>
                                                <input type="file" hidden onChange={handleFileChange} />
                                            </label>
                                            <label className="p-2 cursor-pointer text-white hover:opacity-70 transition-opacity">
                                                <svg aria-label="Attach file" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M12.001 22A9.993 9.993 0 0 1 4.93 19.07l1.414-1.414a7.994 7.994 0 1 0 0-11.314L4.93 4.93A9.993 9.993 0 1 1 12.001 22ZM2.502 12a1 1 0 0 1 1-1h8.498a1 1 0 1 1 0 2H3.502a1 1 0 0 1-1-1Z"></path></svg>
                                                <input type="file" hidden onChange={handleFileChange} />
                                            </label>
                                        </>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="text-[#0095F6] font-semibold text-sm hover:text-white transition-colors px-2"
                                        >
                                            Send
                                        </button>
                                    )}
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#0B1120] p-8 text-center h-full">
                            <div className="w-32 h-32 rounded-full bg-blue-500/5 flex items-center justify-center mb-6 border border-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                                <MessageCircle size={56} className="text-blue-500/80" strokeWidth={1.2} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Your Conversations</h3>
                            <p className="text-gray-400 text-sm mb-8 max-w-xs leading-relaxed">Select a conversation from the sidebar or search constraint to connect with employers and peers.</p>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20" onClick={() => document.querySelector('input[placeholder="Search conversations..."]')?.focus()}>
                                Start a New Chat
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
