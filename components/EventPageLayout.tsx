import React, { ReactNode } from 'react';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface EventPageLayoutProps {
    children: ReactNode;
}

const EventPageLayout: React.FC<EventPageLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-white">
            {/* Minimalist Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Papelería Personalizada Kamaluso
                            </span>
                        </Link>

                        {/* Cart Icon Only */}
                        <Link href="/carrito" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ShoppingCartIcon className="w-6 h-6 text-gray-700" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Simplified Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            © 2024 Papelería Personalizada Kamaluso - Todos los derechos reservados
                        </p>
                        <div className="flex justify-center gap-6 text-sm">
                            <Link href="/terminos" className="text-gray-600 hover:text-purple-600">
                                Términos
                            </Link>
                            <Link href="/privacidad" className="text-gray-600 hover:text-purple-600">
                                Privacidad
                            </Link>
                            <Link href="/contacto" className="text-gray-600 hover:text-purple-600">
                                Contacto
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default EventPageLayout;
