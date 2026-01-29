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
        // Solo ejecutar esta lógica una vez al montar el componente
        const hasSeenChat = typeof window !== 'undefined' ? sessionStorage.getItem('kamaluso_chat_seen') : null;

        if (!hasSeenChat) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('kamaluso_chat_seen', 'true');
                }
            }, 12000); // 12 seconds to be less intrusive

            return () => clearTimeout(timer);
        }
    }, []); // Array vacío = solo se ejecuta una vez al montar

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







                    {/* Header with gradient from logo colors */}
                    <div className="bg-gradient-to-r from-rosa via-naranja to-amarillo p-4 flex justify-between items-center text-white border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-full">
                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Kamaluso Bot</h3>
                                <span className="text-xs text-white/90 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
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
                                        ? 'bg-gradient-to-r from-rosa to-naranja text-white rounded-br-none shadow-md'
                                        : 'bg-white border border-gray-200 text-black rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {/* Helper to parse text with Bold (**text**) and Links (Markdown + Plain URLs) */}
                                    {(() => {
                                        // Note: split includes capturing groups in the result array
                                        const boldParts = msg.content.split(/\*\*(.*?)\*\*/g);

                                        const parsedContent = boldParts.map((part, index) => {
                                            const isBold = index % 2 === 1;

                                            // 2. Parse links within this part
                                            const subParts = [];
                                            let lastIndex = 0;
                                            // Regex matches BOTH [markdown](url) AND plain https://url
                                            const regex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+)/g;
                                            let match;

                                            while ((match = regex.exec(part)) !== null) {
                                                if (match.index > lastIndex) {
                                                    subParts.push(part.substring(lastIndex, match.index));
                                                }

                                                // Check if it's Markdown or Plain
                                                const label = match[1] || match[3] || "Enlace";
                                                const url = match[2] || match[3];

                                                subParts.push(
                                                    <a
                                                        key={`${index}-${match.index}`}
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
                                            if (lastIndex < part.length) {
                                                subParts.push(part.substring(lastIndex));
                                            }

                                            // 3. Return content wrapped if bold
                                            if (isBold) {
                                                return <strong key={index} className="font-bold">{subParts}</strong>;
                                            }
                                            return <span key={index}>{subParts}</span>;
                                        });

                                        return <div className="whitespace-pre-wrap">{parsedContent}</div>;
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
                            className="p-2 bg-gradient-to-r from-rosa to-naranja text-white rounded-full hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Button Container */}
            <div className={`fixed ${router.pathname.includes('/productos/') ? 'bottom-40 md:bottom-28' : 'bottom-24'} right-5 z-40 group`}>
                {/* Tooltip on Hover */}
                {!isOpen && (
                    <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-gradient-to-r from-rosa to-naranja text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-xl font-medium">
                            ¡Asistente Virtual!
                            <div className="absolute top-full right-6 -mt-1">
                                <div className="border-4 border-transparent border-t-rosa"></div>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleToggle}
                    className="p-4 bg-gradient-to-r from-rosa via-naranja to-amarillo text-white rounded-full shadow-lg hover:shadow-2xl hover:shadow-rosa/50 hover:scale-110 transition-all duration-300 relative"
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
            </div>
        </>


    );
};

export default ChatWidget;
