import React from 'react';
import { BookOpenIcon, PaintBrushIcon, TruckIcon } from '@heroicons/react/24/outline';

const steps = [
    {
        id: 1,
        title: 'Elige tu Base',
        description: 'Selecciona tu producto (agenda, libreta, planner) y el interior que necesitas (semana vista, diaria, docentes...).',
        icon: BookOpenIcon,
        color: 'from-pink-500 to-rose-500',
        delay: '0'
    },
    {
        id: 2,
        title: 'Personaliza tu Tapa',
        description: 'Elige diseño de nuestro catálogo, acabado (brillo/mate), con o sin elástico, agrega tu nombre, texto, etc... o envíanos tu propio diseño por WhatsApp.',
        icon: PaintBrushIcon,
        color: 'from-purple-500 to-indigo-500',
        delay: '100'
    },
    {
        id: 3,
        title: 'Recibe tu producto',
        description: 'Retira en nuestro taller en san José de Mayo o te lo enviamos a todo Uruguay en 2 a 5 días.',
        icon: TruckIcon,
        color: 'from-blue-500 to-cyan-500',
        delay: '200'
    }
];

const HowItWorks = () => {
    return (
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden" >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" >
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 font-heading tracking-tight">
                        Crea tu Papelería Ideal en <span className="text-slate-900 underline decoration-4 decoration-amber-400/50 underline-offset-4">3 Pasos Simples</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-600">
                        Transformamos tus ideas en productos tangibles de alta calidad. Sin complicaciones.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 -z-10"></div>

                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className="group relative flex flex-col items-center text-center"
                            style={{ animationDelay: `${step.delay}ms` }}
                        >
                            {/* Icon Circle - Original Gradient Style */}
                            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 shadow-lg md:shadow-xl shadow-gray-200 mb-4 md:mb-6 transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 relative`}>
                                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center relative">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                                    <step.icon className={`w-8 h-8 md:w-10 md:h-10 text-gray-800 relative z-10`} />

                                    {/* Number Badge - Original */}
                                    <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-7 h-7 md:w-8 md:h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm border-3 md:border-4 border-white shadow-md">
                                        {step.id}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 font-outfit group-hover:text-pink-600 transition-colors">
                                {step.title}
                            </h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xs mx-auto">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
