import React, { useState, useRef, useEffect } from 'react';
import { ShareIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
    getWhatsAppShareUrl,
    getFacebookShareUrl,
    getTwitterShareUrl,
    copyToClipboard
} from '../lib/share-utils';
import toast from 'react-hot-toast';

interface ShareProductButtonProps {
    productName: string;
    productUrl: string;
    productImage?: string;
    variant?: 'icon' | 'button';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const ShareProductButton: React.FC<ShareProductButtonProps> = ({
    productName,
    productUrl,
    variant = 'icon',
    size = 'md',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleShare = (platform: string) => {
        let shareUrl = '';

        switch (platform) {
            case 'whatsapp':
                shareUrl = getWhatsAppShareUrl(productUrl, productName);
                break;
            case 'facebook':
                shareUrl = getFacebookShareUrl(productUrl);
                break;
            case 'twitter':
                shareUrl = getTwitterShareUrl(productUrl, productName);
                break;
            case 'copy':
                handleCopyLink();
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
            setIsOpen(false);
        }
    };

    const handleCopyLink = async () => {
        const success = await copyToClipboard(productUrl);
        if (success) {
            setCopied(true);
            toast.success('¡Enlace copiado al portapapeles!');
            setTimeout(() => {
                setCopied(false);
                setIsOpen(false);
            }, 2000);
        } else {
            toast.error('Error al copiar el enlace');
        }
    };

    // Tamaños de botón e ícono
    const sizeClasses = {
        sm: {
            button: 'w-8 h-8 p-1.5',
            icon: 'w-4 h-4',
            text: 'text-xs px-3 py-1.5',
        },
        md: {
            button: 'w-10 h-10 p-2',
            icon: 'w-5 h-5',
            text: 'text-sm px-4 py-2',
        },
        lg: {
            button: 'w-12 h-12 p-2.5',
            icon: 'w-6 h-6',
            text: 'text-base px-5 py-2.5',
        },
    };

    const buttonClasses = variant === 'icon'
        ? `${sizeClasses[size].button} rounded-full bg-white hover:bg-fondoClaro border border-gray-200 hover:border-rosa shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center group`
        : `${sizeClasses[size].text} rounded-lg bg-white hover:bg-fondoClaro border border-gray-200 hover:border-rosa shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 font-medium text-gray-700 group`;

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={buttonClasses}
                aria-label="Compartir producto"
                type="button"
            >
                <ShareIcon className={`${sizeClasses[size].icon} text-gray-600 group-hover:text-rosa transition-colors`} />
                {variant === 'button' && <span>Compartir</span>}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                    <div className="p-2 space-y-1">
                        {/* WhatsApp */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleShare('whatsapp');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors group"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                            <span className="font-medium">WhatsApp</span>
                        </button>

                        {/* Facebook */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleShare('facebook');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className="font-medium">Facebook</span>
                        </button>

                        {/* Twitter/X */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleShare('twitter');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors group"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <span className="font-medium">Twitter / X</span>
                        </button>

                        {/* Divider */}
                        <div className="h-px bg-gray-100 my-1"></div>

                        {/* Copiar enlace */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleShare('copy');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-rosa/10 hover:text-rosa rounded-lg transition-colors group"
                        >
                            {copied ? (
                                <>
                                    <CheckIcon className="w-5 h-5 flex-shrink-0 text-green-500" />
                                    <span className="font-medium text-green-500">¡Copiado!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">Copiar enlace</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareProductButton;
