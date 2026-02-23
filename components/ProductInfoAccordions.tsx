
import { useState } from 'react';
import {
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    LightBulbIcon,
    QuestionMarkCircleIcon,
    ChevronDownIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import UseCasesSection from './UseCasesSection';
import FaqSection from './FaqSection';
import { AnimatePresence, motion } from 'framer-motion';

interface ProductInfoAccordionsProps {
    product: {
        _id: string;
        puntosClave?: string[];
        descripcion?: string;
        descripcionExtensa?: string;
        useCases?: string[];
        faqs?: { question: string; answer: string; }[];
    };
}

const AccordionItem = ({ title, icon: Icon, children, defaultOpen = false }: { title: string, icon: any, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 text-left group transition-colors hover:bg-slate-50 px-2 rounded-lg"
            >
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold uppercase tracking-wider transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                        {title}
                    </span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
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
                        <div className="pb-6 px-2 text-slate-600 text-sm leading-relaxed">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ProductInfoAccordions: React.FC<ProductInfoAccordionsProps> = ({ product }) => {
    const descriptionContent = product.descripcionExtensa || product.descripcion || '';

    return (
        <div className="w-full mt-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {/* 1. Descripción (Prioridad en sidebar) */}
                {descriptionContent && (
                    <AccordionItem title="Descripción" icon={DocumentTextIcon} defaultOpen={true}>
                        <div
                            className="prose prose-sm prose-pink max-w-none text-slate-600"
                            dangerouslySetInnerHTML={{ __html: descriptionContent }}
                        />
                    </AccordionItem>
                )}

                {/* 2. Características */}
                {product.puntosClave && product.puntosClave.length > 0 && (
                    <AccordionItem title="Detalles" icon={ClipboardDocumentListIcon}>
                        <ul className="grid grid-cols-1 gap-2">
                            {product.puntosClave.map((punto, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                                    <span>{punto}</span>
                                </li>
                            ))}
                        </ul>
                    </AccordionItem>
                )}

                {/* 3. Envíos y Garantía */}
                <AccordionItem title="Envíos y Garantía" icon={CheckCircleIcon}>
                    <div className="flex flex-col gap-4">
                        <div>
                            <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Envíos a todo el país</h4>
                            <p>DAC, Mirtrans o Correo Uruguayo. Producción: 2-5 días hábiles.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Garantía Total</h4>
                            <p>Reponeos cualquier defecto de fabricación sin costo.</p>
                        </div>
                    </div>
                </AccordionItem>

                {/* 4. FAQs */}
                {product.faqs && product.faqs.length > 0 && (
                    <AccordionItem title="Preguntas Frecuentes" icon={QuestionMarkCircleIcon}>
                        <div className="flex flex-col gap-4">
                            {product.faqs.slice(0, 3).map((faq, i) => (
                                <div key={i}>
                                    <p className="font-bold text-slate-900 text-xs mb-1">{faq.question}</p>
                                    <p>{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </AccordionItem>
                )}

            </div>
        </div>
    );
};

export default ProductInfoAccordions;
