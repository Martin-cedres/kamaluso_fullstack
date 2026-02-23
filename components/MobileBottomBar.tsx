import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';

const MobileBottomBar = () => {
    const router = useRouter();
    const { cartCount, cartItems } = useCart();
    const isActive = (path: string) => router.pathname === path;

    // Solo mostrar en móvil (md:hidden se encarga, pero aseguramos layout)
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-[40] md:hidden pb-safe transition-all duration-300">
            <div className="flex justify-around items-center h-16">

                {/* Inicio */}
                <Link href="/" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/') ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/') ? 2.5 : 2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-[10px] font-medium">Inicio</span>
                </Link>

                {/* Buscar (Vamos a /productos por ahora, o modal de búsqueda futura) */}
                <Link href="/productos" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/productos') ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/productos') ? 2.5 : 2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-[10px] font-medium">Buscar</span>
                </Link>

                {/* WhatsApp (Acción principal central o lateral?) */}
                <a
                    href="https://wa.me/59898615074"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center w-full h-full text-green-600 hover:text-green-700"
                >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-medium">WhatsApp</span>
                </a>

                {/* Carrito */}
                <Link href="/cart" className={`flex flex-col items-center justify-center w-full h-full relative ${isActive('/cart') ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'}`}>
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/cart') ? 2.5 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">Carrito</span>
                </Link>

            </div>
        </div>
    );
};

export default MobileBottomBar;
