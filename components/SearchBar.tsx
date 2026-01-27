import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import OptimizedImage from './OptimizedImage';

// Define the shape of search results based on API response
interface SearchResult {
    _id: string;
    nombre: string;
    slug: string;
    imageUrl?: string;
    precio?: number;
    basePrice?: number;
    category?: string;
}

const SearchBar = ({ isMobile = false, onClose }: { isMobile?: boolean, onClose?: () => void }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/products/listar?search=${encodeURIComponent(query)}&limit=5`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data.products || []);
                        setShowResults(true);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Clear search on navigation
    useEffect(() => {
        const handleRouteChange = () => {
            setShowResults(false);
            setQuery('');
            if (onClose) onClose();
        };
        router.events.on('routeChangeStart', handleRouteChange);
        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }, [router, onClose]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/productos?search=${encodeURIComponent(query)}`);
            setShowResults(false);
            if (onClose) onClose();
        }
    };

    return (
        <div ref={searchRef} className={`relative w-full ${isMobile ? 'mb-4' : 'max-w-md'}`}>
            <form onSubmit={handleSearchSubmit} className="relative">
                <input
                    type="text"
                    placeholder="Buscar agenda, libreta..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results.length > 0) setShowResults(true); }}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all text-sm"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                    </div>
                )}
            </form>

            {/* Dropdown Results */}
            {showResults && (results.length > 0 || query.length >= 2) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
                    {results.length > 0 ? (
                        <>
                            <div className="max-h-[60vh] overflow-y-auto">
                                {results.map((product) => (
                                    <Link
                                        key={product._id}
                                        href={`/productos/detail/${product.slug}`}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                            <OptimizedImage
                                                src={product.imageUrl || '/placeholder.png'}
                                                alt={product.nombre}
                                                fill
                                                sizes="48px"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-800 truncate">{product.nombre}</h4>
                                            <p className="text-xs text-pink-600 font-bold">
                                                $U {product.precio || product.basePrice || 0}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <button
                                onClick={handleSearchSubmit}
                                className="w-full p-3 text-center text-sm font-bold text-pink-500 bg-pink-50 hover:bg-pink-100 transition-colors"
                            >
                                Ver todos los resultados ({results.length}+)
                            </button>
                        </>
                    ) : (
                        !loading && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No encontramos productos para "{query}" 😔
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
