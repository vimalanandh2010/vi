import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Send, User, MoreVertical, Paperclip, Smile,
    Settings, Plus, ArrowLeft, CheckCheck, Check, MessageSquare,
    Users, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { toast } from 'react-toastify'
import axiosClient from '../../api/axiosClient'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import EmojiPicker from 'emoji-picker-react'

const SeekerChat = () => {
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
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showMobile, setShowMobile] = useState('sidebar') // 'sidebar' | 'chat'

    const myId = user?.id || user?._id

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
            const res = await axiosClient.get('chat/conversations')
            const list = Array.isArray(res) ? res : []
            setChats(list)

            const stateChatId = location.state?.activeChatId
            if (stateChatId) {
                const target = list.find(c => c._id === stateChatId)
                if (target) { setActiveChat(target); markAsSeen(stateChatId) }
                else if (list.length) { setActiveChat(list[0]); markAsSeen(list[0]._id) }
            } else if (list.length) {
                setActiveChat(list[0]); markAsSeen(list[0]._id)
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to load conversations')
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
            const res = await axiosClient.post(`chat/conversations/${activeChat._id}/messages`, { text: content })
            if (res && res._id) {
                // Update the temp message with real data
                setActiveChat(prev => ({
                    ...prev,
                    messages: prev.messages.map(m => m._id === tempMsg._id ? res : m),
                    lastMessage: res
                }))
                setChats(prev => prev.map(c => c._id === activeChat._id ? { ...c, lastMessage: res } : c))
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to send message')
            // Remove optimistic message on failure
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
            const res = await axiosClient.post('chat/conversations/start', { targetUserId: participantId })
            const convo = res.conversation
            if (!convo || !convo._id) return
            setChats(prev => prev.find(c => c._id === convo._id) ? prev : [convo, ...prev])
            setActiveChat(convo)
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
        } catch { toast.error("Failed to delete") }
    }

    const selectChat = (chat) => {
        setActiveChat(chat)
        markAsSeen(chat._id)
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
                <p className="text-slate-500 text-sm font-medium">Loading conversations...</p>
            </div>
        </div>
    )

    return (
        <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
            <Navbar />
            <div className="flex-1 flex overflow-hidden">

                {/* ── CHAT PANEL ── */}
                <div className="flex-1 flex flex-col bg-[#0a0a0f]">
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            {(() => {
                                const other = getOther(activeChat)
                                const online = isUserOnline(other?._id)
                                return (
                                    <div className="h-16 border-b border-white/5 flex items-center px-5 gap-4 bg-[#0f0f17]/80 backdrop-blur-md shrink-0">
                                        <div className="relative">
                                            {other?.photoUrl ? (
                                                <img src={other.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {other?.firstName?.charAt(0) || <User size={18} />}
                                                </div>
                                            )}
                                            {online && (
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0f0f17]" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white text-sm truncate">
                                                {other?.firstName} {other?.lastName}
                                            </h3>
                                            <p className={`text-xs font-medium ${online ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                {online ? '● Active now' : '○ Offline'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate('/seeker/home')}
                                                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5"
                                            >
                                                Exit
                                            </button>
                                            <button
                                                onClick={() => deleteChat(activeChat._id)}
                                                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                                                title="Delete Conversation"
                                            >
                                                <X size={18} />
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
                                                <div className={`max-w-[72%] group`}>
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
                        /* Empty state */
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"
                            >
                                <MessageSquare size={36} className="text-violet-400" />
                            </motion.div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Your Chats</h2>
                                <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">
                                    Connect with recruiters, ask about opportunities, and manage your conversations here.
                                </p>
                                <Link
                                    to="/seeker/community"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-900/40 active:scale-95"
                                >
                                    <Users size={20} />
                                    Explore Communities
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SeekerChat
