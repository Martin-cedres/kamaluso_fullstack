import React from 'react';
import {
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    LightBulbIcon,
    QuestionMarkCircleIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import UseCasesSection from './UseCasesSection';
import FaqSection from './FaqSection';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { IReview } from '../models/Review';

interface ProductDetailedContentProps {
    product: {
        _id: string;
        puntosClave?: string[];
        descripcion?: string;
        descripcionExtensa?: string;
        useCases?: string[];
        faqs?: { question: string; answer: string; }[];
    };
    reviews: IReview[];
    reviewCount: number;
}

const ProductDetailedContent: React.FC<ProductDetailedContentProps> = ({ product, reviews, reviewCount }) => {
    return (
        <div className="w-full mt-8 space-y-16">
            {/* 1. Puntos Clave */}
            {product.puntosClave && product.puntosClave.length > 0 && (
                <section id="puntos-clave" className="scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <ClipboardDocumentListIcon className="h-6 w-6 text-pink-500" />
                        Características Destacadas
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.puntosClave.map((punto, index) => (
                            <li key={index} className="flex items-start bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                                <CheckCircleIcon className="h-6 w-6 text-pink-500 mr-3 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 font-medium">{punto}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* 2. Descripción Completa */}
            {(product.descripcion || product.descripcionExtensa) && (
                <section id="descripcion" className="scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <DocumentTextIcon className="h-6 w-6 text-pink-500" />
                        Descripción del Producto
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed bg-white p-6 rounded-2xl border border-gray-100 shadow-sm" dangerouslySetInnerHTML={{ __html: product.descripcion || product.descripcionExtensa || '' }} />
                </section>
            )}

            {/* 3. Casos de Uso */}
            {product.useCases && product.useCases.length > 0 && (
                <section id="casos-uso" className="scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <LightBulbIcon className="h-6 w-6 text-amarillo" />
                        Ideal para...
                    </h2>
                    <UseCasesSection useCases={product.useCases} />
                </section>
            )}

            {/* 4. Preguntas Frecuentes */}
            {product.faqs && product.faqs.length > 0 && (
                <section id="faqs" className="scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <QuestionMarkCircleIcon className="h-6 w-6 text-azul" />
                        Preguntas Frecuentes
                    </h2>
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <FaqSection faqs={product.faqs} />
                    </div>
                </section>
            )}

            {/* 5. Reseñas */}
            <section id="reviews-section" className="scroll-mt-24 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                    <StarIcon className="h-6 w-6 text-naranja" />
                    Opiniones de Clientes ({reviewCount})
                </h2>
                <div className="max-w-4xl mx-auto">
                    <ReviewForm productId={product._id} onReviewSubmit={() => window.location.reload()} />
                    <div className="mt-10">
                        <ReviewList reviews={reviews} />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductDetailedContent;
