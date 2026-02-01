import { useState } from 'react';
import {
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    LightBulbIcon,
    QuestionMarkCircleIcon,
    StarIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import UseCasesSection from './UseCasesSection';
import FaqSection from './FaqSection';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { IReview } from '../models/Review';
import { AnimatePresence, motion } from 'framer-motion';

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

const AccordionItem = ({ title, icon: Icon, children, defaultOpen = false }: { title: string, icon: any, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-200 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-6 text-left group transition-colors hover:bg-gray-50/50 px-2 rounded-lg"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-500 group-hover:bg-pink-50 group-hover:text-pink-500'}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                        {title}
                    </span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                </div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pb-8 px-2 pl-14 text-gray-600">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ProductDetailedContent: React.FC<ProductDetailedContentProps> = ({ product, reviews, reviewCount }) => {
    // Determinar qué descripción mostrar
    const descriptionContent = product.descripcionExtensa || product.descripcion || '';

    return (
        <div className="w-full mt-8 max-w-5xl mx-auto">

            {/* Contenedor de Acordeones con estilo de tarjeta unificada */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-16">

                {/* 1. Características Destacadas (Siempre visible o primer acordeón abierto por defecto) */}
                {product.puntosClave && product.puntosClave.length > 0 && (
                    <AccordionItem title="Características Destacadas" icon={ClipboardDocumentListIcon} defaultOpen={true}>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {product.puntosClave.map((punto, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckCircleIcon className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">{punto}</span>
                                </li>
                            ))}
                        </ul>
                    </AccordionItem>
                )}

                {/* 2. Descripción del Producto */}
                {descriptionContent && (
                    <AccordionItem title="Descripción Detallada" icon={DocumentTextIcon}>
                        <div
                            className="prose prose-pink max-w-none text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: descriptionContent }}
                        />
                    </AccordionItem>
                )}

                {/* 3. Casos de Uso (Ideal para...) */}
                {product.useCases && product.useCases.length > 0 && (
                    <AccordionItem title="Ideal para..." icon={LightBulbIcon}>
                        <UseCasesSection useCases={product.useCases} />
                    </AccordionItem>
                )}

                {/* 4. Preguntas Frecuentes */}
                {product.faqs && product.faqs.length > 0 && (
                    <AccordionItem title="Preguntas Frecuentes" icon={QuestionMarkCircleIcon}>
                        <FaqSection faqs={product.faqs} />
                    </AccordionItem>
                )}

                {/* 5. Envíos y Garantía (Estático, siempre útil) */}
                <AccordionItem title="Envíos y Garantía" icon={CheckCircleIcon}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">Envíos a todo el país</h4>
                            <p>Realizamos envíos a través de DAC, Mirtrans o Correo Uruguayo. El tiempo de producción es de 2 a 5 días hábiles + tiempo de envío.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">Garantía de Satisfacción</h4>
                            <p>Si tu producto tiene algún defecto de fabricación, lo reponemos sin costo. Revisamos cada detalle antes de enviar.</p>
                        </div>
                    </div>
                </AccordionItem>

                {/* 6. Opiniones (Solo si son pocas < 3 se muestran aquí dentro) */}
                {reviewCount < 3 && (
                    <AccordionItem title="Opiniones" icon={StarIcon}>
                        <div className="pt-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">¿Ya tienes este producto?</h4>
                            <p className="text-center text-gray-500 mb-6">Sé el primero en compartir tu experiencia y ayuda a otros compradores.</p>
                            <ReviewForm productId={product._id} onReviewSubmit={() => window.location.reload()} />
                            <div className="mt-8">
                                <ReviewList reviews={reviews} />
                            </div>
                        </div>
                    </AccordionItem>
                )}

            </div>

            {/* 7. Sección de Reseñas Destacada (Solo si hay >= 3 opiniones) */}
            {reviewCount >= 3 && (
                <section id="reviews-section" className="scroll-mt-24 pt-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                            <StarIcon className="h-8 w-8 text-amarillo fill-amarillo" />
                            Opiniones de Clientes
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-gray-600 font-medium">
                            <span className="text-2xl font-bold text-gray-900">{reviewCount}</span>
                            <span>valoraciones verificadas</span>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto bg-gray-50 rounded-3xl p-6 md:p-10 border border-gray-100">
                        <div className="mb-12">
                            <ReviewForm productId={product._id} onReviewSubmit={() => window.location.reload()} />
                        </div>
                        <ReviewList reviews={reviews} />
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetailedContent;
