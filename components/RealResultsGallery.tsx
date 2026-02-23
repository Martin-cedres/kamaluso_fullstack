import { useState, useEffect } from 'react';
import Link from 'next/link';
import RealResultCard from './RealResultCard';
import dynamic from 'next/dynamic';

// Dynamic imports for Swiper to avoid SSR "window not defined" errors
const Swiper = dynamic(() => import('swiper/react').then(mod => mod.Swiper), { ssr: false });
const SwiperSlide = dynamic(() => import('swiper/react').then(mod => mod.SwiperSlide), { ssr: false });

import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface RealResult {
    _id: string;
    title: string;
    description?: string;
    mockupImage: string;
    realImage: string;
}

export default function RealResultsGallery() {
    const [results, setResults] = useState<RealResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch('/api/real-results');
                if (!res.ok) throw new Error('Error fetching results');
                const data = await res.json();
                setResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    if (loading) return null;
    if (results.length === 0) return null;

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4 tracking-tighter">
                        Expectativas hechas realidad
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
                        La calidad que ves en el diseño es la calidad que recibes.
                        Compara nuestros mockups digitales con fotos reales tomadas en nuestro taller, sin filtros ni producción, para que veas exactamente lo que te llegará.
                    </p>
                    <Link
                        href="/nuestros-trabajos-entregados"
                        className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                    >
                        Ver todos nuestros trabajos
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>

                <div className="max-w-6xl mx-auto">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: true }}
                        breakpoints={{
                            640: {
                                slidesPerView: 1,
                            },
                            768: {
                                slidesPerView: 1,
                            },
                            1024: {
                                slidesPerView: 2,
                            },
                        }}
                        className="pb-12"
                    >
                        {results.map((result) => (
                            <SwiperSlide key={result._id}>
                                <RealResultCard
                                    title={result.title}
                                    description={result.description}
                                    mockupImage={result.mockupImage}
                                    realImage={result.realImage}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
