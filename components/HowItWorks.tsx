import React from 'react';
import { BookOpenIcon, PaintBrushIcon, TruckIcon } from '@heroicons/react/24/outline';

const steps = [
    {
        id: 1,
        title: 'Imagina tu año',
        description: 'Encuentra la base perfecta para tus planes. Elige entre agendas, libretas o planners con el interior que mejor se adapte a tu ritmo.',
        icon: BookOpenIcon,
        delay: '0'
    },
    {
        id: 2,
        title: 'Dale una identidad',
        description: 'Viste tu compañera con diseños de nuestro catálogo o envíanos tu propia idea. Asesoría personalizada vía Atelier Digital.',
        icon: PaintBrushIcon,
        delay: '100'
    },
    {
        id: 3,
        title: 'El placer de recibir',
        description: 'Cuidamos cada detalle del embalaje. Retira en nuestro taller o recíbelo en 2 a 5 días en cualquier rincón de Uruguay.',
        icon: TruckIcon,
        delay: '200'
    }
];

const HowItWorks = () => {
    return (
        <section className="py-20 md:py-28 bg-[#FBF9F7] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 md:mb-24">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900/5 text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-8">
                        Nuestro Proceso
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif italic text-slate-900 mb-6 leading-tight">
                        El Arte de Crear tu <br />
                        <span className="font-sans not-italic font-black uppercase tracking-tighter">Compañera de Rutina</span>
                    </h2>
                    <div className="w-16 h-[1px] bg-slate-200 mb-8"></div>
                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Un viaje desde tu imaginación hasta tus manos, cuidado por artesanos uruguayos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-20">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className="group relative flex flex-col items-start"
                        >
                            {/* Oversized Faint Number Backdrop */}
                            <span className="absolute -top-12 -left-4 text-8xl md:text-9xl font-black text-slate-100/60 select-none z-0">
                                0{step.id}
                            </span>

                            <div className="relative z-10 w-full">
                                <div className="mb-8 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 inline-flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <step.icon className="w-6 h-6 md:w-8 md:h-8 text-slate-800" />
                                </div>

                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                                    {step.title}
                                </h3>

                                <p className="text-base text-slate-500 leading-relaxed mb-6 font-medium">
                                    {step.description}
                                </p>

                                <button className="text-[10px] font-bold tracking-widest uppercase text-slate-400 border-b border-transparent hover:border-slate-900 hover:text-slate-900 transition-all duration-300">
                                    Saber más
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
