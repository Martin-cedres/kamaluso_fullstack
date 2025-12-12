import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PaperAirplaneIcon, XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

const ChatWidget = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [hasClosed, setHasClosed] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, isOpen]);

    // Auto-open chat after 10 seconds (ONLY ONCE PER SESSION)
    useEffect(() => {
        const timer = setTimeout(() => {
            // Check session storage to see if chat has already been shown/interacted with
            const hasSeenChat = typeof window !== 'undefined' ? sessionStorage.getItem('kamaluso_chat_seen') : false;

            if (!hasSeenChat && history.length === 0 && !isOpen && !hasClosed) {
                setIsOpen(true);
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('kamaluso_chat_seen', 'true');
                }
            }
        }, 12000); // 12 seconds to be less intrusive
        return () => clearTimeout(timer);
    }, [history, isOpen, hasClosed]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage('');
        setHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: history, // Enviamos historial para contexto
                    conversationId: conversationId
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setHistory(prev => [...prev, { role: 'model', content: data.response }]);
                if (data.conversationId) {
                    setConversationId(data.conversationId);
                }
            } else {

                setHistory(prev => [...prev, { role: 'model', content: 'Lo siento, tuve un problema procesando tu mensaje. Intenta de nuevo.' }]);
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            setHistory(prev => [...prev, { role: 'model', content: 'Error de conexión. Por favor revisa tu internet.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChipClick = (text: string) => {
        setMessage(text);
        // Optional: auto-submit
        // handleSubmit(); // We'll let user confirm send for now
    };

    const quickChips = [
        "Ver Agendas 2026",
        "Precios y Envíos",
        "Hablar con Humano",
        "Regalos Empresariales"
    ];

    const handleClose = () => {
        setIsOpen(false);
        setHasClosed(true);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('kamaluso_chat_seen', 'true');
        }
    };

    const handleToggle = () => {
        if (isOpen) {
            setHasClosed(true);
        } else {
            // If user manually opens, mark as seen so it doesn't auto-open later
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('kamaluso_chat_seen', 'true');
            }
        }
        setIsOpen(!isOpen);
    };

    return (
        <>



            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-[170px] right-5 md:bottom-5 md:right-28 z-40 w-[85vw] sm:w-[340px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all animate-in slide-in-from-bottom-2 fade-in duration-300 flex flex-col max-h-[calc(100vh-250px)] md:max-h-[calc(100vh-100px)]">







                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-full">
                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Kamaluso Bot</h3>
                                <span className="text-xs text-pink-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    En línea
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 min-h-[300px]">
                        {history.length === 0 && (
                            <div className="text-center text-gray-500 mt-8 text-sm">
                                <p className="font-semibold text-gray-700">👋 ¡Hola! Soy tu Asistente de Organización.</p>
                                <p className="mt-2">¿En qué puedo ayudarte hoy? ✨</p>
                            </div>
                        )}

                        {history.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm break-words ${msg.role === 'user'
                                        ? 'bg-pink-600 text-white rounded-br-none'
                                        : 'bg-white border border-gray-200 text-black rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {/* Helper to parse text with links (Markdown + Plain URLs) */}
                                    {(() => {
                                        const parts = [];
                                        let lastIndex = 0;
                                        // Regex matches BOTH [markdown](url) AND plain https://url
                                        // Group 1: Label (Markdown)
                                        // Group 2: URL (Markdown)
                                        // Group 3: URL (Plain)
                                        const regex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+)/g;
                                        let match;
                                        const text = msg.content;

                                        while ((match = regex.exec(text)) !== null) {
                                            if (match.index > lastIndex) {
                                                parts.push(text.substring(lastIndex, match.index));
                                            }

                                            // Check if it's Markdown or Plain
                                            const label = match[1] || match[3] || "Enlace";
                                            const url = match[2] || match[3];

                                            parts.push(
                                                <a
                                                    key={match.index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`hover:underline font-bold ${msg.role === 'user' ? 'text-white underline' : 'text-blue-600'}`}
                                                >
                                                    {label === url ? ' (Ver Link) ' : label}
                                                </a>
                                            );
                                            lastIndex = regex.lastIndex;
                                        }
                                        if (lastIndex < text.length) {
                                            parts.push(text.substring(lastIndex));
                                        }
                                        return <span className="whitespace-pre-wrap">{parts}</span>;
                                    })()}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                {/* Typing Indicator */}
                                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-md flex items-center gap-1 w-16 h-10 justify-center">
                                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />

                        {/* Chips removed as per user request */}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe tu consulta..."
                            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-gray-800"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !message.trim()}
                            className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={handleToggle}
                className={`fixed ${router.pathname.includes('/productos/') ? 'bottom-32 md:bottom-24' : 'bottom-24'} right-5 z-40 p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group`}
                aria-label="Chat con soporte"
            >
                {isOpen ? (
                    <XMarkIcon className="w-7 h-7" />
                ) : (
                    <div className="relative">
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                        </span>
                        <ChatBubbleLeftRightIcon className="w-7 h-7 group-hover:animate-bounce" />
                    </div>
                )}
            </button>
        </>


    );
};

export default ChatWidget;
