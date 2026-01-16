import { GetStaticProps } from 'next'
import SeoMeta from '../../components/SeoMeta'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import connectDB from '../../lib/mongoose'
import Product from '../../models/Product'

interface Props {
    suggestedProducts: any[]
}

export default function TapaDuraPremiumPage({ suggestedProducts }: Props) {

    const [formData, setFormData] = useState({
        companyName: '',
        yourName: '',
        email: '',
        phone: '',
        quantity: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [responseMessage, setResponseMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProductSelect = (productValue: string) => {
        if (productValue) {
            setFormData({ ...formData, message: `Me interesa cotizar: ${productValue}\n${formData.message}` });
        }
        const formElement = document.getElementById('contacto');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setResponseMessage('');

        try {
            const res = await fetch('/api/contact-b2b', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setResponseMessage(data.message);
                setFormData({
                    companyName: '',
                    yourName: '',
                    email: '',
                    phone: '',
                    quantity: '',
                    message: '',
                });
            } else {
                setStatus('error');
                setResponseMessage(data.message || 'Hubo un error al enviar tu solicitud.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setStatus('error');
            setResponseMessage('Hubo un error de conexión. Inténtalo de nuevo más tarde.');
        }
    };

    const faqs = [
        {
            question: '¿Qué diferencia a la tapa dura de otros productos?',
            answer: 'La tapa dura ofrece máxima resistencia y durabilidad. Con laminado brillo o mate, protege tu agenda durante todo el año manteniendo un aspecto impecable. Es la opción premium ideal para empresas que valoran calidad y presencia.',
        },
        {
            question: '¿Qué tipos de laminado ofrecen?',
            answer: 'Ofrecemos dos acabados: laminado brillo (acabado luminoso y elegante) y laminado mate (acabado suave y sofisticado). Ambos protegen la tapa contra el desgaste diario y aportan durabilidad excepcional.',
        },
        {
            question: '¿Cuál es el gramaje del papel que utilizan?',
            answer: 'Utilizamos papel premium de 80g, especialmente seleccionado para evitar que la tinta traspase y garantizar una escritura suave y profesional.',
        },
        {
            question: '¿Cuánto tiempo toma producir agendas tapa dura para empresas?',
            answer: 'Para pedidos pequeños (1-10 unidades), el tiempo de producción es de 5-7 días hábiles. Para volúmenes mayores, coordinamos el tiempo según la cantidad. Al cotizar te confirmamos la fecha exacta de entrega.',
        },
        {
            question: '¿Puedo ver una muestra antes de confirmar el pedido?',
            answer: 'Absolutamente. Preparamos un mockup digital sin costo para validar el diseño antes de imprimir. Para pedidos grandes (+100 unidades), podemos coordinar una muestra física.',
        },
    ];

    // Schema.org JSON-LD mejorado con @graph para múltiples tipos
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "name": "Agendas y Libretas Tapa Dura Premium Personalizadas",
                "provider": {
                    "@type": "LocalBusiness",
                    "name": "Kamaluso - Papelería Personalizada",
                    "image": "https://www.papeleriapersonalizada.uy/logo.webp",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Massini 136",
                        "addressLocality": "San José de Mayo",
                        "addressRegion": "San José",
                        "addressCountry": "UY"
                    },
                    "telephone": "+59898615074",
                    "priceRange": "$$"
                },
                "description": "Agendas y libretas tapa dura personalizadas con laminado brillo o mate. Papel premium 80g. Producción artesanal en Uruguay para empresas que valoran calidad y durabilidad.",
                "areaServed": [
                    { "@type": "City", "name": "Montevideo" },
                    { "@type": "City", "name": "Canelones" },
                    { "@type": "City", "name": "Maldonado" },
                    { "@type": "City", "name": "San José de Mayo" },
                    { "@type": "Country", "name": "Uruguay" }
                ],
                "serviceType": "Premium Corporate Gifts"
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Inicio",
                        "item": "https://www.papeleriapersonalizada.uy"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Regalos Empresariales",
                        "item": "https://www.papeleriapersonalizada.uy/regalos-empresariales"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": "Tapa Dura Premium",
                        "item": "https://www.papeleriapersonalizada.uy/regalos-empresariales/tapa-dura-premium"
                    }
                ]
            },
            {
                "@type": "FAQPage",
                "mainEntity": faqs.map(faq => ({
                    "@type": "Question",
                    "name": faq.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.answer
                    }
                }))
            }
        ]
    };

    return (
        <>
            <SeoMeta
                title="Agendas Tapa Dura Personalizadas Uruguay 2026 | Libretas Premium Kamaluso"
                description="📌 Agendas y libretas tapa dura personalizadas con tu logo. Laminado brillo/mate + papel 80g premium. Sin mínimo. Regalos empresariales que duran todo el año."
                url="/regalos-empresariales/tapa-dura-premium"
                image="/regalo-agenda-empresarial.webp"
                keywords="agendas tapa dura personalizadas uruguay, libretas institucionales premium, cuadernos tapa dura con logo, regalos empresariales premium uruguay, agendas corporativas tapa dura montevideo"
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className="min-h-screen bg-white text-gray-900 font-sans">
                {/* Hero Section Premium */}
                <section className="relative bg-slate-950 text-white py-28 px-6 overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]"></div>
                        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px]"></div>
                    </div>

                    <div className="absolute inset-0 opacity-30 grayscale">
                        <Image
                            src="/regalo-agenda-empresarial.webp"
                            alt="Agendas y libretas tapa dura personalizadas Uruguay"
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950"></div>
                    </div>

                    <div className="relative max-w-5xl mx-auto text-center z-10">
                        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-widest mb-8 uppercase">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                            Línea Premium Tapa Dura
                        </div>

                        <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                            Regalos empresariales <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">que duran todo el año</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                            Agendas y libretas con <span className="text-white font-medium">tapa dura de calidad artesanal</span>. Laminado brillo o mate que protege tu marca. Papel premium 80g para una escritura impecable.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                            <button
                                onClick={() => handleProductSelect('')}
                                className="group relative px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-lg font-bold rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-1 transition-all duration-300"
                            >
                                Solicitar Cotización
                            </button>
                            <Link
                                href="#productos"
                                className="px-10 py-5 border border-slate-700 text-slate-200 text-lg font-semibold rounded-xl hover:bg-slate-800/50 hover:text-white hover:border-slate-500 transition-all duration-300 backdrop-blur-sm"
                            >
                                Ver Productos Premium
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Sección de Materiales Premium (NUEVA) */}
                <section className="py-24 px-6 bg-slate-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <span className="text-amber-600 font-bold tracking-[0.2em] text-xs uppercase mb-3 block">Materiales Kamaluso</span>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">La diferencia está en <span className="text-amber-600">los detalles</span></h2>
                            <div className="w-20 h-1 bg-amber-500 mx-auto mt-6 rounded-full opacity-50"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                {
                                    title: 'Laminado Premium',
                                    desc: 'Acabado brillo o mate que protege la tapa contra el desgaste diario. Resistencia superior para uso intensivo durante todo el año.',
                                    icon: (
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: 'Papel 80g Premium',
                                    desc: 'Gramaje seleccionado para garantizar una escritura suave sin traspaso de tinta. Compatibilidad total con plumas estilográficas y marcadores.',
                                    icon: (
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: 'Espiral Metálico',
                                    desc: 'Construcción reforzada con espiral metálico de alta resistencia. Apertura 360° para comodidad de escritura y durabilidad garantizada.',
                                    icon: (
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.315a4.833 4.833 0 01-4.477 0L6.3 14.547a6 6 0 01-3.86-.517l-2.387.477a2 2 0 00-1.022.547V18a2 2 0 001.022.547l2.387.477a6 6 0 003.86-.517l.691-.315a4.833 4.833 0 014.477 0l.691.315a6 6 0 003.86.517l2.387-.477a2 2 0 001.022-.547V15.428z" />
                                        </svg>
                                    )
                                },
                            ].map((item, idx) => (
                                <div key={idx} className="group bg-white p-10 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-amber-500/20 transition-all duration-500 hover:-translate-y-2">
                                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-500">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-slate-900">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed font-light">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* Productos Sugeridos Premium */}
                <section id="productos" className="px-6 py-24 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div className="max-w-2xl">
                                <span className="text-amber-600 font-bold tracking-widest text-xs uppercase mb-3 block">Selección Tapa Dura</span>
                                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
                                    Nuestros <span className="text-amber-600">Productos Premium</span>
                                </h2>
                            </div>
                            <p className="text-slate-500 max-w-sm text-lg font-light leading-relaxed">
                                Libretas y agendas tapa dura personalizadas. Calidad artesanal que representa tu marca.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {suggestedProducts.map((product) => (
                                <div
                                    key={product._id}
                                    className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col overflow-hidden border border-slate-100"
                                >
                                    <div className="relative w-full h-80 bg-slate-50 overflow-hidden">
                                        <Image
                                            src={product.imageUrl || '/placeholder.png'}
                                            alt={`${product.nombre} - Tapa Dura Premium Personalizada Uruguay`}
                                            fill
                                            sizes="(max-width: 767px) 90vw, 33vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-500"></div>
                                    </div>
                                    <div className="p-10 flex flex-col flex-grow">
                                        <h3 className="font-bold text-2xl mb-4 text-slate-900 group-hover:text-amber-600 transition-colors">{product.nombre}</h3>
                                        <p className="text-slate-500 mb-8 flex-grow leading-relaxed font-light line-clamp-3">
                                            {product.descripcionBreve || product.descripcion}
                                        </p>
                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center text-sm text-slate-600 gap-3">
                                                <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                Tapa Dura con Laminado Brillo/Mate
                                            </div>
                                            <div className="flex items-center text-sm text-slate-600 gap-3">
                                                <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                Papel Premium 80g
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleProductSelect(product.nombre)}
                                            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-amber-500 transition-all duration-300 shadow-lg shadow-slate-200"
                                        >
                                            Cotizar ahora
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sección de Preguntas Frecuentes */}
                <section className="px-6 py-20 bg-slate-50">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                            Preguntas Frecuentes
                        </h2>
                        <div className="space-y-6">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 hover:shadow-md transition border border-slate-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-start">
                                        <span className="text-amber-600 mr-3 text-xl">?</span>
                                        {faq.question}
                                    </h3>
                                    <p className="text-gray-600 ml-8 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                        {/* Link a FAQ completo */}
                        <div className="mt-12 text-center">
                            <Link href="/preguntas-frecuentes-b2b" className="inline-flex items-center text-amber-600 font-bold hover:text-amber-700 transition gap-2">
                                ¿Tenés más dudas? Consultá nuestra guía completa de preguntas para empresas
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Formulario de Contacto B2B Premium (REUTILIZADO) */}
                <section id="contacto" className="px-6 py-28 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 overflow-hidden flex flex-col lg:flex-row border border-slate-100">

                            {/* Columna de Info Corporativa */}
                            <div className="bg-slate-900 text-white p-12 lg:w-2/5 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-amber-500 rounded-full blur-[80px]"></div>
                                </div>

                                <div className="relative z-10">
                                    <span className="text-amber-400 font-bold tracking-widest text-xs uppercase mb-4 block">Línea Premium</span>
                                    <h3 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">Calidad que <span className="text-amber-400">Perdura</span></h3>
                                    <p className="text-slate-400 mb-10 text-lg font-light leading-relaxed">
                                        Completa el formulario y recibí una propuesta personalizada para tus agendas y libretas tapa dura.
                                    </p>

                                    <div className="space-y-6">
                                        {[
                                            { icon: '✉️', label: 'Email Directo', val: 'kamalusosanjose@gmail.com' },
                                            { icon: '📞', label: 'Línea Corporativa', val: '098 615 074' },
                                            { icon: '📍', label: 'Taller Central', val: 'Massini 136, San José de Mayo' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl group-hover:bg-amber-500 transition-colors duration-300">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{item.label}</p>
                                                    <p className="text-slate-200 font-medium">{item.val}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-16 pt-8 border-t border-slate-800 relative z-10">
                                    <div className="flex items-center gap-3 text-amber-400/80 mb-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-bold uppercase tracking-wider">Compromiso 24hs</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-light">
                                        Garantizamos una respuesta técnica y comercial en menos de 24 horas hábiles.
                                    </p>
                                </div>
                            </div>

                            {/* Columna del Formulario */}
                            <div className="p-12 lg:w-3/5 bg-white">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2 font-heading">Solicitar Presupuesto</h2>
                                    <p className="text-slate-500 font-light">Sin compromiso de compra. Mockup digital incluido.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="companyName" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Empresa *</label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                id="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-transparent transition-all outline-none text-slate-800"
                                                placeholder="Nombre de la institución"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="yourName" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contacto *</label>
                                            <input
                                                type="text"
                                                name="yourName"
                                                id="yourName"
                                                value={formData.yourName}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-transparent transition-all outline-none text-slate-800"
                                                placeholder="Nombre y apellido"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Corporativo *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-transparent transition-all outline-none text-slate-800"
                                                placeholder="ejemplo@empresa.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider">WhatsApp / Teléfono</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-transparent transition-all outline-none text-slate-800"
                                                placeholder="09X XXX XXX"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="quantity" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cantidad Estimada *</label>
                                        <input
                                            type="text"
                                            name="quantity"
                                            id="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-transparent transition-all outline-none text-slate-800"
                                            placeholder="Ej: 50 unidades"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Especificaciones del Proyecto *</label>
                                        <textarea
                                            name="message"
                                            id="message"
                                            rows={4}
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-transparent transition-all outline-none text-slate-800 resize-none"
                                            placeholder="Bríndanos detalles: tipo de producto (agenda/libreta), cantidad, acabado preferido (brillo/mate) y cualquier otra preferencia."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-5 px-8 bg-slate-900 text-white rounded-xl shadow-xl shadow-slate-200 text-lg font-bold hover:bg-amber-500 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Procesando...
                                            </>
                                        ) : 'Enviar Solicitud de Presupuesto'}
                                    </button>

                                    {status === 'success' && (
                                        <div className="flex items-center gap-3 p-5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                                            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="font-medium">{responseMessage}</p>
                                        </div>
                                    )}
                                    {status === 'error' && (
                                        <div className="flex items-center gap-3 p-5 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 animate-in fade-in-from-bottom-2">
                                            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="font-medium">{responseMessage}</p>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    try {
        await connectDB()

        // Buscar productos TAPA DURA específicos: Libretas + Agendas (Semanal, 2 Días, Diaria)
        const libreta = await Product.findOne({
            status: 'activo',
            nombre: { $regex: /libreta/i },
            $or: [
                { nombre: { $regex: /tapa dura/i } },
                { tapa: 'tapa-dura' }
            ]
        }).lean();

        const weekly = await Product.findOne({
            status: 'activo',
            nombre: { $regex: /semana a la vista/i },
            $or: [
                { nombre: { $regex: /tapa dura/i } },
                { tapa: 'tapa-dura' }
            ]
        }).lean();

        const twoDays = await Product.findOne({
            status: 'activo',
            nombre: { $regex: /dos d[íi]as por/i },
            $or: [
                { nombre: { $regex: /tapa dura/i } },
                { tapa: 'tapa-dura' }
            ]
        }).lean();

        const daily = await Product.findOne({
            status: 'activo',
            nombre: { $regex: /un d[íi]a por/i },
            $or: [
                { nombre: { $regex: /tapa dura/i } },
                { tapa: 'tapa-dura' }
            ]
        }).lean();

        let products = [libreta, weekly, twoDays, daily].filter(p => p !== null && p !== undefined);

        // Fallback: Si no se encuentran suficientes, buscar cualquier producto tapa dura
        if (products.length < 3) {
            const fallbackProducts = await Product.find({
                status: 'activo',
                $or: [
                    { nombre: { $regex: /tapa dura/i } },
                    { tapa: 'tapa-dura' }
                ]
            }).limit(4).lean();

            products = fallbackProducts;
        }

        // Serializar para evitar errores con ObjectIds y fechas
        const serializedProducts = products.map(doc => {
            const product = JSON.parse(JSON.stringify(doc));
            return {
                _id: product._id,
                nombre: product.nombre,
                slug: product.slug,
                imageUrl: product.imageUrl || (product.images && product.images[0]) || '',
                descripcion: product.descripcion,
                descripcionBreve: product.descripcionBreve || '',
                basePrice: product.basePrice || 0
            }
        });

        return {
            props: {
                suggestedProducts: serializedProducts
            },
            revalidate: 3600, // Revalidar cada hora
        }
    } catch (error) {
        console.error('Error fetching Tapa Dura products:', error)
        return {
            props: {
                suggestedProducts: []
            },
            revalidate: 60,
        }
    }
}
