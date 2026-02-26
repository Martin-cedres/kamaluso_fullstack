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
    const messagesEndRef = useRef<HTMLDivElement>(null);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, isOpen]);

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

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>



            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-[170px] right-5 md:bottom-28 md:right-32 z-50 w-[88vw] sm:w-[380px] bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 ring-1 ring-black/5 overflow-hidden transition-all animate-in slide-in-from-bottom-4 fade-in duration-500 flex flex-col max-h-[calc(100vh-250px)] md:max-h-[calc(100vh-200px)] font-sans">

                    {/* Header: Editorial & Luxury */}
                    <div className="p-6 pb-4 flex justify-between items-start border-b border-black/5">
                        <div className="flex flex-col">
                            <h3 className="font-serif italic text-2xl text-slate-900 leading-tight">
                                Asistente <br />
                                <span className="text-slate-500 text-lg not-italic font-sans font-light uppercase tracking-[0.2em]">Kamaluso AI</span>
                            </h3>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En línea para ayudarte</span>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-400"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[350px] scrollbar-hide">
                        {history.length === 0 && (
                            <div className="text-center py-8">
                                <p className="font-serif italic text-xl text-slate-800">"El orden es el placer de la razón"</p>
                                <p className="mt-4 text-slate-500 text-sm leading-relaxed max-w-[200px] mx-auto uppercase tracking-tighter font-light">
                                    ¿En qué podemos ayudarte hoy con tu organización?
                                </p>
                            </div>
                        )}

                        {history.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`relative max-w-[85%] p-4 rounded-[24px] text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-slate-900 text-white rounded-br-none shadow-lg'
                                        : 'bg-white text-slate-700 rounded-bl-none shadow-[0_5px_15px_rgba(0,0,0,0.03)] border border-black/5'
                                        }`}
                                >
                                    {/* Helper to parse text with Bold (**text**) and Links (Markdown + Plain URLs) */}
                                    {(() => {
                                        const boldParts = msg.content.split(/\*\*(.*?)\*\*/g);
                                        const parsedContent = boldParts.map((part, index) => {
                                            const isBold = index % 2 === 1;
                                            const subParts = [];
                                            let lastIndex = 0;
                                            const regex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+)/g;
                                            let match;

                                            while ((match = regex.exec(part)) !== null) {
                                                if (match.index > lastIndex) {
                                                    subParts.push(part.substring(lastIndex, match.index));
                                                }
                                                const label = match[1] || match[3] || "Enlace";
                                                const url = match[2] || match[3];
                                                subParts.push(
                                                    <a
                                                        key={`${index}-${match.index}`}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`font-bold underline decoration-1 underline-offset-4 ${msg.role === 'user' ? 'text-white' : 'text-slate-900'}`}
                                                    >
                                                        {label === url ? ' Ver detalle ' : label}
                                                    </a>
                                                );
                                                lastIndex = regex.lastIndex;
                                            }
                                            if (lastIndex < part.length) {
                                                subParts.push(part.substring(lastIndex));
                                            }
                                            if (isBold) {
                                                return <strong key={index} className="font-bold text-inherit">{subParts}</strong>;
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
                                <div className="bg-white/50 p-3 rounded-full flex items-center gap-1.5 px-4 shadow-sm border border-black/5">
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white/50 backdrop-blur-md border-t border-black/5">
                        <form onSubmit={handleSubmit} className="relative flex items-center">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Escriba aquí..."
                                className="w-full pl-6 pr-14 py-4 bg-white rounded-full text-sm border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)] focus:ring-1 focus:ring-slate-900/10 placeholder:text-slate-300 text-slate-800 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !message.trim()}
                                className="absolute right-2 p-2.5 bg-slate-900 text-white rounded-full hover:bg-black disabled:opacity-30 transition-all shadow-md group"
                            >
                                <PaperAirplaneIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Button - Luxury Design */}
            <div className="fixed bottom-28 right-8 z-50 group">
                <button
                    onClick={handleToggle}
                    className={`relative p-5 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.2)] border-2 border-[#E5B5A1] overflow-hidden transition-all duration-500 hover:scale-110 active:scale-95 ${isOpen
                        ? 'bg-slate-900 text-white'
                        : 'bg-gradient-to-br from-[#1E3A8A] via-[#4C1D95] to-[#7C3AED] text-white'
                        }`}
                    aria-label="Chatbot de Asistencia"
                >
                    {/* Gloss Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {isOpen ? (
                        <XMarkIcon className="w-6 h-6 relative z-10" />
                    ) : (
                        <div className="relative z-10 flex items-center justify-center">
                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                            </span>
                        </div>
                    )}
                </button>
            </div>

        </>


    );
};

export default ChatWidget;
