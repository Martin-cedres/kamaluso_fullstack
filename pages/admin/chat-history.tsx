import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { UserCircleIcon, ComputerDesktopIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';

interface Message {
    role: 'user' | 'model';
    content: string;
    timestamp: string;
}

interface Conversation {
    _id: string;
    messages: Message[];
    startedAt: string;
    lastMessageAt: string;
    deviceInfo?: string;
}

export default function ChatHistory() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedId) {
            setTimeout(scrollToBottom, 100);
        }
    }, [selectedId]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/admin/chat/history');
            const data = await res.json();
            setConversations(data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const selectedConversation = conversations.find(c => c._id === selectedId);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-UY', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <Head>
                <title>Historial de Chats | Admin</title>
            </Head>

            <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-4 md:gap-6">
                {/* Sidebar List */}
                <div className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-700">Conversaciones</h2>
                        <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-1 rounded-full">
                            {conversations.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-400 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="p-8 text-center text-gray-500 text-sm">No hay chats registrados.</p>
                        ) : (
                            conversations.map(conv => (
                                <button
                                    key={conv._id}
                                    onClick={() => setSelectedId(conv._id)}
                                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-all duration-200 group ${selectedId === conv._id ? 'bg-pink-50 border-l-4 border-l-pink-500' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-semibold text-sm ${selectedId === conv._id ? 'text-pink-700' : 'text-gray-700'}`}>
                                            {formatDate(conv.lastMessageAt)}
                                        </span>
                                        <span className="text-[10px] text-gray-400 bg-white border border-gray-100 px-1.5 py-0.5 rounded-md shadow-sm">
                                            {conv.messages.length} msgs
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate group-hover:text-gray-700">
                                        {conv.messages[conv.messages.length - 1]?.content || 'Sin mensajes'}
                                    </p>
                                    <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                                        <ComputerDesktopIcon className="w-3 h-3" />
                                        <span className="font-mono">{conv._id.substring(0, 8)}...</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Detail */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-pink-500">
                                        <UserCircleIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-800 text-sm">Cliente Anónimo</h2>
                                        <p className="text-xs text-gray-500 font-mono">ID: {selectedConversation._id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400 mb-0.5">Iniciado el</div>
                                    <div className="text-xs font-medium text-gray-600">
                                        {formatDate(selectedConversation.startedAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 scroll-smooth">
                                {selectedConversation.messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[85%] md:max-w-[75%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Avatar */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'}`}>
                                                {msg.role === 'user' ? (
                                                    <UserCircleIcon className="w-5 h-5" />
                                                ) : (
                                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                                )}
                                            </div>

                                            {/* Bubble */}
                                            <div className={`rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                                    ? 'bg-white border border-pink-100 text-gray-800 rounded-tr-none'
                                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                                }`}>
                                                <div className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-pink-500 text-right' : 'text-purple-500 text-left'}`}>
                                                    {msg.role === 'user' ? 'Cliente' : 'Kamaluso Bot'}
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                                                    {msg.content}
                                                </div>
                                                <div className={`mt-2 text-[10px] text-gray-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                    {formatDate(msg.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50/50">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300" />
                            </div>
                            <p className="text-lg font-medium text-gray-400">Selecciona una conversación</p>
                            <p className="text-sm text-gray-400 mt-2">para ver el historial de mensajes</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
