import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';
import {
    Search, Send, MessageCircle, User, LogOut,
    Smile, Paperclip, X, FileText, Download, Check, CheckCheck,
    Plus, MoreVertical, Filter, Phone, Video, Info
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
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-50 text-slate-500">
                <p className="animate-pulse font-bold text-sm">Loading...</p>
            </div>
        );
    }

    // REGISTRATION UI (Portal Style)
    if (showRegister) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-[350px] text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                        <MessageCircle size={36} className="text-blue-600" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome to Chat</h2>
                    <p className="text-slate-500 text-sm mb-8 font-medium">Create a unique handle to start connecting with employers and peers.</p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Choose a username"
                                value={regHandle}
                                onChange={(e) => setRegHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-3 px-4 text-slate-900 outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                                required
                                minLength={3}
                                maxLength={24}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isRegistering || regHandle.length < 3}
                            className="w-full bg-[#1e3a8a] hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-all shadow-md"
                        >
                            {isRegistering ? 'Creating...' : 'Get Started'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            <Navbar />
            <div className="flex flex-1 h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] text-slate-900 font-sans border-t border-slate-200 overflow-hidden">
                {/* Sidebar */}
                <div className="w-[350px] border-r border-slate-200 flex flex-col bg-slate-50 shrink-0">
                    <div className="pt-6 pb-2 px-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                Chats
                            </h2>
                            <div className="flex items-center gap-3">
                                <button className="w-8 h-8 rounded-full bg-[#6d28d9] text-white flex items-center justify-center hover:bg-[#5b21b6] shadow-md transition-all">
                                    <Plus size={18} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search For Contacts or Messages"
                                className="w-full bg-slate-100 rounded-full py-2.5 pl-11 pr-4 text-sm font-semibold outline-none text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-lg text-slate-900">All Chats</span>
                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-3">
                        {searchQuery.length > 2 && (
                            <div className="animate-in fade-in duration-300">
                                {searchResults.length > 0 ? (
                                    searchResults.map(u => (
                                        <button
                                            key={u._id}
                                            onClick={() => startChat(u._id)}
                                            className="w-full flex items-center gap-3 py-3 px-3 hover:bg-white transition-colors rounded-xl text-left group border border-transparent hover:border-slate-200 hover:shadow-sm mb-1"
                                        >
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 bg-slate-50 font-bold text-[#1e3a8a] text-lg shadow-inner">
                                                {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover" /> : u.firstName?.charAt(0).toUpperCase() || <User size={20} className="text-slate-400" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900">{u.firstName} {u.lastName}</div>
                                                <div className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wider">{u.role}</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="px-4 py-8 text-sm font-bold text-slate-500 text-center">No accounts found.</p>
                                )}
                            </div>
                        )}

                        {searchQuery.length <= 2 && (
                            <div className="space-y-1 mt-1">
                                {conversations.length === 0 && !isLoading && (
                                    <div className="text-center py-12 px-6">
                                        <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <MessageCircle size={24} className="text-slate-400" />
                                        </div>
                                        <p className="text-slate-900 font-black text-sm">No conversations yet.</p>
                                        <p className="text-slate-500 font-medium text-xs mt-2">Search for users to start chatting.</p>
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
                                            className={`w-full flex items-center gap-3 py-3 px-3 rounded-2xl transition-all duration-200 group mb-2 border relative overflow-hidden ${isActive ? 'bg-white border-[#6d28d9] shadow-sm' : 'hover:bg-slate-100 border-transparent hover:border-slate-200'}`}
                                        >
                                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#6d28d9]"></div>}
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 bg-slate-100 font-bold text-[#6d28d9] text-lg relative">
                                                {target.photoUrl ? <img src={target.photoUrl} className="w-full h-full object-cover" /> : target.firstName?.charAt(0).toUpperCase() || <User size={20} className="text-slate-400" />}
                                                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className={`text-sm font-black truncate text-slate-900`}>
                                                        {target.firstName} {target.lastName}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {convo.lastMessage?.timestamp ? new Date(convo.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                </div>
                                                <div className={`text-xs font-medium truncate mt-1 ${isActive ? 'text-slate-500' : 'text-slate-500'}`}>
                                                    {convo.lastMessage?.sender === user?._id && 'You: '}{convo.lastMessage?.text || 'Sent an attachment'}
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
                <div className="flex-1 flex flex-col bg-slate-50 relative">
                    {activeConvo ? (
                        <>
                            {/* Header */}
                            <div className="h-[75px] px-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 w-full shrink-0">
                                {(() => {
                                    const target = activeConvo.participants?.find(p => p._id !== user?._id);
                                    return target ? (
                                        <>
                                            <div className="flex items-center gap-4 cursor-pointer">
                                                <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 bg-slate-100 font-bold text-[#6d28d9] text-lg relative">
                                                    {target.photoUrl ? <img src={target.photoUrl} className="w-full h-full object-cover" /> : target.firstName?.charAt(0).toUpperCase() || <User size={20} className="text-slate-400" />}
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00d084] border-2 border-white rounded-full"></span>
                                                </div>
                                                <div className="leading-tight">
                                                    <div className="font-bold text-slate-900 text-[15px]">{target.firstName} {target.lastName}</div>
                                                    <div className="text-[13px] text-slate-500 mt-0.5">Online</div>
                                                </div>
                                            </div>
                                        </>
                                    ) : null;
                                })()}
                            </div>

                            {/* Target Profile Summary */}
                            <div className="flex-1 overflow-y-auto px-5 py-6 bg-slate-50 custom-scrollbar flex flex-col relative">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ffffff,transparent)] opacity-50 pointer-events-none" />
                                {messages.length === 0 && activeConvo?.participants && (
                                    <div className="flex flex-col items-center justify-center mt-8 mb-12 relative z-10">
                                        <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden mb-4 border-4 border-white bg-slate-50 font-bold text-[#1e3a8a] text-4xl shadow-xl">
                                            {activeConvo.participants.find(p => p._id !== user?._id)?.photoUrl ?
                                                <img src={activeConvo.participants.find(p => p._id !== user?._id)?.photoUrl} className="w-full h-full object-cover" />
                                                : activeConvo.participants.find(p => p._id !== user?._id)?.firstName?.charAt(0).toUpperCase() || <User size={40} className="text-slate-400" />
                                            }
                                        </div>
                                        <span className="text-2xl font-black text-slate-900 mb-2">
                                            {activeConvo.participants.find(p => p._id !== user?._id)?.firstName} {activeConvo.participants.find(p => p._id !== user?._id)?.lastName}
                                        </span>
                                        <span className="text-xs font-bold text-blue-600 mb-6 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200 uppercase tracking-widest shadow-sm">
                                            Job Portal User · {activeConvo.participants.find(p => p._id !== user?._id)?.role}
                                        </span>
                                        <button className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-black px-6 py-3 rounded-xl text-xs transition-all shadow-sm hover:shadow-md uppercase tracking-widest">
                                            View Full Profile
                                        </button>
                                    </div>
                                )}

                                {messages.map((m, i) => {
                                    const isMe = m.sender === user?._id;
                                    const prevMsg = i > 0 ? messages[i - 1] : null;

                                    const isFirstInGroup = !prevMsg || prevMsg.sender !== m.sender;
                                    const senderInfo = activeConvo.participants?.find(p => p._id === m.sender);

                                    return (
                                        <div key={m._id || i} className={`w-full flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-[6px] first:mt-auto relative z-10`}>
                                            {isFirstInGroup && (
                                                <div className={`flex items-center gap-2 mb-2 px-1 ${isMe ? 'flex-row-reverse mt-4' : 'mt-4'}`}>
                                                    {!isMe && senderInfo && (
                                                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200">
                                                            {senderInfo.photoUrl ? (
                                                                <img src={senderInfo.photoUrl} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center font-bold text-[#6d28d9] text-[13px]">
                                                                    {senderInfo.firstName?.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <span className="text-[13px] font-bold text-slate-900">
                                                        {isMe ? 'You' : `${senderInfo?.firstName} ${senderInfo?.lastName}`}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-[11px] font-bold text-slate-400">
                                                        {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                    {!isMe && <CheckCheck size={14} className="text-emerald-500 ml-0.5" />}
                                                    {isMe && <CheckCheck size={14} className="text-emerald-500 mr-0.5" />}
                                                </div>
                                            )}

                                            <div className="w-full flex">
                                                {!isMe && <div className="w-11 shrink-0"></div>}
                                                <div className={`max-w-[70%] px-5 py-3.5 text-[14px] leading-relaxed group relative rounded-2xl ${isMe ? 'bg-white text-slate-800 font-medium border border-slate-200 ml-auto shadow-sm' : 'bg-[#f8fafc] text-slate-800 font-medium border border-slate-100'}`}>
                                                    {m.fileUrl && (
                                                        <div className="mb-2">
                                                            {m.fileType === 'image' ? (
                                                                <img src={m.fileUrl} alt="Attached" className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity border border-slate-200 shadow-sm" />
                                                            ) : (
                                                                <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl hover:opacity-90 transition-all border shadow-sm ${isMe ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? 'bg-white border border-slate-200 text-[#6d28d9]' : 'bg-slate-50 border border-slate-200 text-[#6d28d9]'}`}>
                                                                        <FileText size={20} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-bold truncate">Attachment</p>
                                                                    </div>
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    {m.text && <p className="break-words">{m.text}</p>}
                                                </div>
                                                {isMe && <div className="w-11 shrink-0"></div>}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex-shrink-0 relative z-20 flex justify-center">
                                <div className="w-full max-w-4xl relative">
                                    {filePreview && (
                                        <div className="mb-3 bg-white p-2.5 rounded-xl flex items-center justify-between mx-4 max-w-sm border border-slate-200 shadow-xl shadow-slate-200/50 absolute bottom-full left-0">
                                            <div className="flex items-center gap-3">
                                                {typeof filePreview === 'string' ? (
                                                    <img src={filePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 shadow-inner">
                                                        <FileText className="text-blue-600" size={20} />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <p className="text-sm font-black text-slate-900 truncate">{typeof filePreview === 'string' ? 'Image selected' : filePreview.name}</p>
                                                    <p className="text-xs font-bold text-slate-500 mt-0.5">Ready to send</p>
                                                </div>
                                            </div>
                                            <button onClick={() => { setSelectedFile(null); setFilePreview(null); }} className="p-2 bg-slate-100 hover:bg-red-50 rounded-full transition-colors text-slate-500 hover:text-red-500 hover:border-red-200 border border-transparent">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}

                                    <form onSubmit={sendMessage} className="flex flex-row items-center border border-slate-200 focus-within:border-[#1e3a8a] focus-within:ring-4 focus-within:ring-blue-50 bg-white shadow-sm rounded-xl min-h-[50px] px-3 relative transition-all mx-0">
                                        <div className="flex-1 relative mx-2 h-full py-[14px] flex items-center">
                                            <textarea
                                                value={msgText}
                                                onChange={(e) => setMsgText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
                                                placeholder="Type Your Message"
                                                className="w-full bg-transparent border border-[#6d28d9] rounded-lg px-4 py-2 text-slate-900 font-medium outline-none placeholder-slate-400 text-[14px] resize-none self-center max-h-32 custom-scrollbar flex items-center h-[38px] leading-tight"
                                                style={{ display: 'block' }}
                                            />
                                            {showEmojiPicker && (
                                                <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
                                                    <EmojiPicker onEmojiClick={onEmojiClick} theme="light" width={320} height={400} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 pr-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                className="p-2 text-slate-400 hover:text-slate-600 transition-all rounded-full"
                                            >
                                                <Smile size={18} />
                                            </button>
                                            <label className="p-2 cursor-pointer text-slate-400 hover:text-slate-600 transition-all rounded-full">
                                                <FileText size={18} />
                                                <input type="file" hidden onChange={handleFileChange} />
                                            </label>

                                            <button
                                                type="submit"
                                                className="ml-1 w-10 h-10 rounded-xl flex items-center justify-center bg-[#6d28d9] text-white hover:bg-[#5b21b6] transition-all shadow-sm"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 text-center h-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#f8fafc,transparent)] pointer-events-none" />
                            <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center mb-6 border-4 border-white shadow-xl relative z-10">
                                <MessageCircle size={48} className="text-slate-300" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight relative z-10">Your Conversations</h3>
                            <p className="text-slate-500 text-sm mb-8 max-w-sm leading-relaxed font-medium relative z-10">Select a conversation from the sidebar or search to connect with employers and peers.</p>
                            <button className="bg-slate-900 hover:bg-[#1e3a8a] text-white font-black text-sm py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 relative z-10 uppercase tracking-widest" onClick={() => document.querySelector('input[placeholder="Search conversations..."]')?.focus()}>
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
