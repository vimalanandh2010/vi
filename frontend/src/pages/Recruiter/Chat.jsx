import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Send, User, MoreVertical, Paperclip, Smile,
    Settings, Plus, ArrowLeft, CheckCheck, Check, MessageSquare,
    Users
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { toast } from 'react-toastify'
import axiosClient from '../../api/axiosClient'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import ChatIdModal from '../../components/ChatIdModal'
import EmojiPicker from 'emoji-picker-react'

const RecruiterChat = () => {
    const { user } = useAuth()
    const { incomingMessage, setIncomingMessage, isUserOnline } = useChat()
    const location = useLocation()
    const navigate = useNavigate()
    const messagesEndRef = useRef(null)

    const [chats, setChats] = useState([])
    const [activeChat, setActiveChat] = useState(null)
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showIdModal, setShowIdModal] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showMobile, setShowMobile] = useState('sidebar') // 'sidebar' | 'chat'

    const myId = user?.id || user?._id

    useEffect(() => {
        if (user && !user.chatId) setShowIdModal(true)
    }, [user])

    useEffect(() => { fetchChats() }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeChat?.messages])

    // Real-time listener
    useEffect(() => {
        if (!incomingMessage) return
        const { chatId, message } = incomingMessage

        setChats(prev => {
            const idx = prev.findIndex(c => c._id === chatId)
            if (idx === -1) return prev
            const updated = [...prev]
            const chat = { ...updated[idx], messages: [...updated[idx].messages, message], lastMessage: message }
            updated.splice(idx, 1)
            return [chat, ...updated]
        })

        if (activeChat?._id === chatId) {
            setActiveChat(prev => ({ ...prev, messages: [...prev.messages, message] }))
            markAsSeen(chatId)
        } else {
            toast.info('💬 New message received!', { icon: false })
        }
        setIncomingMessage(null)
    }, [incomingMessage])

    const fetchChats = async () => {
        try {
            const res = await axiosClient.get('/chat')
            const list = Array.isArray(res) ? res : []
            setChats(list)

            const stateChatId = location.state?.activeChatId
            if (stateChatId) {
                const target = list.find(c => c._id === stateChatId)
                if (target) { setActiveChat(target); markAsSeen(stateChatId); setShowMobile('chat') }
                else if (list.length) { setActiveChat(list[0]); markAsSeen(list[0]._id) }
            } else if (list.length) {
                setActiveChat(list[0]); markAsSeen(list[0]._id)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const markAsSeen = async (chatId) => {
        try { await axiosClient.put(`/chat/${chatId}/seen`) } catch { /* silent */ }
    }

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !activeChat || sending) return

        const content = newMessage.trim()
        const tempMsg = { sender: myId, content, timestamp: new Date(), _id: `temp_${Date.now()}` }

        setNewMessage('')
        setShowEmojiPicker(false)
        setSending(true)
        setActiveChat(prev => ({ ...prev, messages: [...prev.messages, tempMsg] }))

        try {
            const res = await axiosClient.post(`/chat/${activeChat._id}/message`, { content })
            if (res && res._id) {
                setActiveChat(res)
                setChats(prev => prev.map(c => c._id === res._id ? res : c))
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to send message')
            setActiveChat(prev => ({ ...prev, messages: prev.messages.filter(m => m._id !== tempMsg._id) }))
        } finally {
            setSending(false)
        }
    }

    const handleSearch = async (val) => {
        setSearchQuery(val)
        if (val.length < 2) { setSearchResults([]); return }
        setIsSearching(true)
        try {
            const res = await axiosClient.get(`/chat/search?q=${encodeURIComponent(val)}`)
            setSearchResults(Array.isArray(res) ? res : [])
        } catch { /* silent */ } finally { setIsSearching(false) }
    }

    const startNewChat = async (participantId) => {
        try {
            const res = await axiosClient.post('/chat', { participantId })
            if (!res || !res._id) return
            setChats(prev => prev.find(c => c._id === res._id) ? prev : [res, ...prev])
            setActiveChat(res)
            setSearchQuery('')
            setSearchResults([])
            setShowMobile('chat')
        } catch { toast.error('Failed to start conversation') }
    }

    const deleteChat = async (chatId) => {
        if (!window.confirm("Permanently delete this conversation?")) return
        try {
            await axiosClient.delete(`/chat/${chatId}`)
            toast.success("Conversation deleted")
            setChats(prev => prev.filter(c => c._id !== chatId))
            if (activeChat?._id === chatId) setActiveChat(null)
            setShowMobile('sidebar')
        } catch { toast.error("Failed to delete") }
    }

    const selectChat = (chat) => {
        setActiveChat(chat)
        markAsSeen(chat._id)
        setShowMobile('chat')
    }

    const getOther = (chat) => chat?.participants?.find(p => p._id !== myId)

    const filteredChats = chats.filter(chat => {
        const other = getOther(chat)
        const name = `${other?.firstName || ''} ${other?.lastName || ''}`.toLowerCase()
        return name.includes(searchQuery.toLowerCase()) ||
            chat.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

    if (loading) return (
        <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                <p className="text-slate-500 text-sm font-medium">Loading chats...</p>
            </div>
        </div>
    )

    return (
        <div className="h-screen bg-[#0a0a0f] flex overflow-hidden text-white">

            {/* ── LEFT SIDEBAR ── */}
            <div className={`${showMobile === 'sidebar' ? 'flex' : 'hidden'} md:flex w-full md:w-[340px] lg:w-[380px] border-r border-white/5 flex-col bg-[#0f0f17] shrink-0`}>

                {/* Sidebar Header */}
                <div className="px-5 pt-5 pb-4 border-b border-white/5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Chats</h1>
                            <p className="text-xs text-slate-500 mt-0.5">Recruiter Inbox</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/recruiter/community"
                                className="p-2 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 transition-all border border-violet-500/20"
                                title="Go to Communities"
                            >
                                <Users size={16} />
                            </Link>
                            <button
                                onClick={() => setShowIdModal(true)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-violet-400 transition-all border border-white/5"
                                title="Edit Chat ID"
                            >
                                <Settings size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input
                            type="text"
                            placeholder="Search candidates, recruiters..."
                            value={searchQuery}
                            onChange={e => handleSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 text-white rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50 placeholder:text-slate-600 transition-all"
                        />
                    </div>
                </div>

                {/* Search Results */}
                <AnimatePresence>
                    {searchQuery.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="mx-3 mt-3 bg-[#17172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
                        >
                            <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Search Results
                            </p>
                            {isSearching ? (
                                <div className="flex justify-center py-4">
                                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="pb-2">
                                    {searchResults.map(u => (
                                        <button
                                            key={u._id}
                                            onClick={() => startNewChat(u._id)}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
                                        >
                                            <div className="relative shrink-0">
                                                {u.photoUrl ? (
                                                    <img src={u.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-sm">
                                                        {u.firstName?.charAt(0)}
                                                    </div>
                                                )}
                                                {isUserOnline(u._id) && (
                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#17172a]" />
                                                )}
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold truncate">{u.firstName} {u.lastName}</p>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${u.role === 'employer'
                                                        ? 'bg-violet-500/20 text-violet-400'
                                                        : 'bg-blue-500/20 text-blue-400'}`}>
                                                        {u.role === 'employer' ? 'Recruiter' : 'Seeker'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">@{u.chatId || u.email}</p>
                                            </div>
                                            <Plus size={14} className="text-slate-500 shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            ) : searchQuery.length >= 2 ? (
                                <p className="text-xs text-slate-600 text-center py-5">No results for "{searchQuery}"</p>
                            ) : null}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 mt-2">
                    {filteredChats.length === 0 && !searchQuery ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                                <Users size={26} className="text-violet-400" />
                            </div>
                            <p className="text-slate-400 text-sm font-medium">No conversations</p>
                            <p className="text-slate-600 text-xs">Search candidates to start chatting</p>
                        </div>
                    ) : (
                        filteredChats.map(chat => {
                            const other = getOther(chat)
                            const isActive = activeChat?._id === chat._id
                            const unread = chat.messages.filter(m => !m.read && m.sender !== myId).length

                            return (
                                <button
                                    key={chat._id}
                                    onClick={() => selectChat(chat)}
                                    className={`w-full px-4 py-3.5 flex items-center gap-3 transition-all relative
                                        ${isActive ? 'bg-violet-500/10' : 'hover:bg-white/3'}`}
                                >
                                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-violet-500 rounded-r" />}

                                    <div className="relative shrink-0">
                                        {other?.photoUrl ? (
                                            <img
                                                src={other.photoUrl}
                                                alt=""
                                                className="w-12 h-12 rounded-full object-cover"
                                                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                                            />
                                        ) : null}
                                        <div
                                            className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold"
                                            style={{ display: other?.photoUrl ? 'none' : 'flex' }}
                                        >
                                            {other?.firstName?.charAt(0) || <User size={20} />}
                                        </div>
                                        {isUserOnline(other?._id) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#0f0f17]" />
                                        )}
                                    </div>

                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-violet-300' : 'text-white'}`}>
                                                {other?.firstName} {other?.lastName}
                                            </h3>
                                            <span className="text-[10px] text-slate-600 shrink-0 ml-2">
                                                {formatTime(chat.lastMessage?.timestamp)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {other?.role === 'seeker' ? (
                                                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wide">Candidate</span>
                                            ) : (
                                                <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wide">Recruiter</span>
                                            )}
                                            <span className="text-slate-700">·</span>
                                            <p className={`text-xs truncate ${unread > 0 ? 'text-white font-semibold' : 'text-slate-500'}`}>
                                                {chat.lastMessage?.content || 'Start a conversation'}
                                            </p>
                                        </div>
                                    </div>

                                    {unread > 0 && (
                                        <span className="w-5 h-5 bg-violet-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                            {unread > 9 ? '9+' : unread}
                                        </span>
                                    )}
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* ── RIGHT CHAT PANEL ── */}
            <div className={`${showMobile === 'chat' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[#0a0a0f]`}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        {(() => {
                            const other = getOther(activeChat)
                            const online = isUserOnline(other?._id)
                            return (
                                <div className="h-16 border-b border-white/5 flex items-center px-5 gap-4 bg-[#0f0f17]/80 backdrop-blur-md shrink-0">
                                    <button
                                        onClick={() => setShowMobile('sidebar')}
                                        className="md:hidden p-1.5 text-slate-400 hover:text-white"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>

                                    <div className="relative">
                                        {other?.photoUrl ? (
                                            <img src={other.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-sm">
                                                {other?.firstName?.charAt(0) || <User size={18} />}
                                            </div>
                                        )}
                                        {online && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0f0f17]" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm truncate">
                                            {other?.firstName} {other?.lastName}
                                        </h3>
                                        <p className={`text-xs font-medium ${online ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {online ? '● Active now' : '○ Offline'}
                                            {other?.role === 'seeker' && <span className="ml-2 text-blue-400/70">· Candidate</span>}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate('/recruiter/home')}
                                            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5"
                                        >
                                            Exit
                                        </button>
                                        <button
                                            onClick={() => deleteChat(activeChat._id)}
                                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                                            title="Delete Conversation"
                                        >
                                            <ArrowLeft size={18} className="rotate-45" /> {/* Using specialized icon or X */}
                                        </button>
                                        <button className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })()}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
                            <AnimatePresence initial={false}>
                                {activeChat.messages.map((msg, idx) => {
                                    const isMe = msg.sender === myId || msg.sender?._id === myId
                                    const showTime = idx === activeChat.messages.length - 1 ||
                                        new Date(activeChat.messages[idx + 1]?.timestamp) - new Date(msg.timestamp) > 300000

                                    return (
                                        <motion.div
                                            key={msg._id || idx}
                                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.15 }}
                                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}
                                        >
                                            <div className="max-w-[72%] group">
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-lg
                                                    ${isMe
                                                        ? 'bg-violet-600 text-white rounded-br-sm shadow-violet-900/30'
                                                        : 'bg-[#1e1e30] text-slate-200 rounded-bl-sm border border-white/5'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                                {showTime && (
                                                    <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-[10px] text-slate-600">
                                                            {formatTime(msg.timestamp)}
                                                        </span>
                                                        {isMe && (
                                                            msg.read
                                                                ? <CheckCheck size={12} className="text-violet-400" />
                                                                : <Check size={12} className="text-slate-600" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="px-5 py-4 border-t border-white/5 bg-[#0f0f17]/60 shrink-0 relative">
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        className="absolute bottom-20 left-5 z-50 shadow-2xl rounded-2xl overflow-hidden"
                                    >
                                        <EmojiPicker
                                            onEmojiClick={({ emoji }) => setNewMessage(p => p + emoji)}
                                            theme="dark"
                                            searchDisabled
                                            skinTonesDisabled
                                            height={380}
                                            width={320}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={sendMessage} className="flex items-center gap-3 bg-[#1e1e30] border border-white/5 rounded-2xl px-4 py-2.5 focus-within:border-violet-500/30 transition-all">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(p => !p)}
                                    className={`p-1 transition-colors ${showEmojiPicker ? 'text-violet-400' : 'text-slate-600 hover:text-slate-400'}`}
                                >
                                    <Smile size={20} />
                                </button>
                                <button type="button" className="p-1 text-slate-600 hover:text-slate-400 transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Write a message..."
                                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                                />
                                <motion.button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    whileTap={{ scale: 0.92 }}
                                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl shadow-lg shadow-violet-900/30 transition-all"
                                >
                                    <Send size={16} />
                                </motion.button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"
                        >
                            <MessageSquare size={36} className="text-violet-400" />
                        </motion.div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">Recruiter Chats</h2>
                            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                                Manage candidate conversations, schedule interviews, and coordinate your hiring pipeline here.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <ChatIdModal
                isOpen={showIdModal}
                currentId={user?.chatId}
                onClose={() => user?.chatId && setShowIdModal(false)}
                onSave={(newId) => { if (user) user.chatId = newId; setShowIdModal(false) }}
            />
        </div>
    )
}

export default RecruiterChat
