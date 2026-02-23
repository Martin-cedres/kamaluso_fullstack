import React, { useState, useCallback } from 'react';

/**
 * Extrae el ID de video de una URL de YouTube.
 * Soporta: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 */
export const getYouTubeId = (url: string): string | null => {
    const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/
    );
    return match?.[1] || null;
};

/**
 * Genera la URL del thumbnail de YouTube en alta resolución.
 */
export const getYouTubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

interface ProductVideoProps {
    videoUrl: string;
    alt?: string;
    className?: string;
}

/**
 * Componente ProductVideo — Lazy-loading YouTube embed.
 * 
 * Muestra un thumbnail estático con botón de play.
 * Al hacer clic, carga el iframe de YouTube (ahorrando datos hasta que el usuario decide ver).
 * Usa youtube-nocookie.com para privacidad y rel=0 para no sugerir otros videos.
 */
const ProductVideo: React.FC<ProductVideoProps> = ({ videoUrl, alt = 'Video del producto', className = '' }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoId = getYouTubeId(videoUrl);

    const handlePlay = useCallback(() => {
        setIsPlaying(true);
    }, []);

    if (!videoId) return null;

    const thumbnailUrl = getYouTubeThumbnail(videoId);

    return (
        <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
            {isPlaying ? (
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                    title={alt}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                />
            ) : (
                <button
                    onClick={handlePlay}
                    className="group/play relative w-full h-full cursor-pointer focus:outline-none"
                    aria-label={`Reproducir video: ${alt}`}
                >
                    {/* Thumbnail de YouTube */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={thumbnailUrl}
                        alt={alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />

                    {/* Overlay oscuro sutil */}
                    <div className="absolute inset-0 bg-black/20 group-hover/play:bg-black/30 transition-colors duration-300" />

                    {/* Botón de Play central */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-white">
                            <svg
                                className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900 ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>

                    {/* Badge "Video" */}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Video
                    </div>
                </button>
            )}
        </div>
    );
};

export default ProductVideo;
