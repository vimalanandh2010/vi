import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

const RecruiterHelperChat = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: "Hi there! 👋 I'm your recruitment assistant. How can I help you manage your hiring today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // Role check at the bottom or just before JSX return
    const isEmployer = user && user.role === 'employer';

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');

        // Add user message to UI immediately
        const newMessages = [...messages, { role: 'user', text: userText }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await axiosClient.post('/bot-chat/ask', {
                message: userText
            });

            setMessages([...newMessages, { role: 'model', text: response.response }]);
        } catch (error) {
            console.error('Chatbot API Error:', error);
            toast.error("Sorry, I'm having trouble connecting to my brain right now.");
            setMessages([...newMessages, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isEmployer) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[340px] sm:w-[380px] h-[500px] max-h-[70vh] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

                    {/* Header - Minimalist Light */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 text-black">
                        <div className="flex items-center gap-2">
                            <Bot size={20} className="text-black" />
                            <h3 className="font-black tracking-tight text-sm text-black">Recruitment Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-black p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-gray-300">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-black' : 'bg-white border border-gray-200'}`}>
                                        {msg.role === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className="text-gray-600" />}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed font-medium ${msg.role === 'user'
                                        ? 'bg-black text-white rounded-tr-sm'
                                        : 'bg-white border border-gray-200 text-black rounded-tl-sm shadow-sm'
                                        }`}>
                                        {msg.text.split('\n').map((line, i) => (
                                            <p key={i} className={i !== 0 ? 'mt-1' : ''}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start w-full">
                                <div className="flex gap-2 max-w-[85%] flex-row">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-white border border-gray-200">
                                        <Bot size={12} className="text-gray-600" />
                                    </div>
                                    <div className="px-5 py-4 rounded-2xl bg-white border border-gray-200 text-black rounded-tl-sm shadow-sm flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about hiring..."
                            disabled={isLoading}
                            className="flex-1 bg-slate-50 border border-gray-200 text-black placeholder:text-gray-400 font-medium rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-400 focus:bg-white transition-all disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-white p-2 rounded-xl transition-all flex items-center justify-center disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin text-white" /> : <Send size={18} />}
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-2 transition-all duration-300 hover:scale-110 active:scale-95 z-50 ${isOpen
                    ? 'bg-gray-900 text-white rotate-90 border-transparent shadow-[0_10px_20px_rgba(0,0,0,0.3)]'
                    : 'bg-white text-black border-gray-200 hover:border-gray-900 group'
                    }`}
                aria-label="Toggle Recruitment Assistant"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:text-black text-gray-700 transition-colors" />}
            </button>
        </div>
    );
};

export default RecruiterHelperChat;
