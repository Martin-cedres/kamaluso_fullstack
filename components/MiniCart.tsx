import Link from 'next/link';
import Image from 'next/image';
import { CartItem, useCart } from '../context/CartContext';

interface MiniCartProps {
    cartItems: CartItem[];
    onClose: () => void;
}

import CartDiscountPromo from './CartDiscountPromo';
import CartSuggestions from './CartSuggestions';

const MiniCart = ({ cartItems, onClose }: MiniCartProps) => {
    // Usar valores del contexto en lugar de recalcular
    const { totalBeforeDiscount, discountAmount, finalTotal } = useCart();
    // Fallback simple por si el hook falla o SSR issue (aunque MiniCart es client-side)
    // Nota: Mejor importar useCart arriba.

    if (cartItems.length === 0) {
        return (
            <div className="absolute right-0 top-full mt-2 bg-white shadow-2xl rounded-xl p-6 w-80 z-50 animate-fadeIn">
                <div className="text-center py-8">
                    <svg
                        className="w-16 h-16 mx-auto text-gray-300 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute right-0 top-full mt-2 bg-white shadow-2xl rounded-xl p-4 w-96 z-50 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800">Mi Carrito</h3>
                <span className="text-sm text-gray-500">{cartItems.length} items</span>
            </div>

            {/* Promo Area */}
            <CartDiscountPromo />

            {/* Cart Items */}
            <div className="max-h-80 overflow-y-auto space-y-3 mb-4">
                {cartItems.map((item) => (
                    <div key={`${item._id}-${item.finish || 'default'}`} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                        {/* Image */}
                        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            {item.imageUrl ? (
                                <Image
                                    src={item.imageUrl}
                                    alt={item.nombre}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-800 truncate">{item.nombre}</h4>
                            {item.finish && (
                                <p className="text-xs text-gray-500">Acabado: {item.finish}</p>
                            )}
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-600">Cant: {item.quantity}</span>
                                <span className="font-bold text-pink-500">${item.precio * item.quantity}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-3 mb-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-500 text-sm">Subtotal:</span>
                    <span className="text-gray-700">${totalBeforeDiscount.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-green-600 text-sm font-medium">Descuento (10%):</span>
                        <span className="text-green-600 font-bold">-${discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-lg text-gray-800">Total:</span>
                    <span className="font-bold text-xl text-pink-600">${finalTotal.toFixed(2)}</span>
                </div>

                {/* Suggestions */}
                <CartSuggestions />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Link
                    href="/cart"
                    onClick={onClose}
                    className="flex-1 bg-gray-100 text-gray-800 py-2.5 px-4 rounded-lg font-semibold text-sm text-center hover:bg-gray-200 transition"
                >
                    Ver Carrito
                </Link>
                <Link
                    href="/checkout"
                    onClick={onClose}
                    className="flex-1 bg-pink-500 text-white py-2.5 px-4 rounded-lg font-semibold text-sm text-center hover:bg-pink-600 transition shadow-lg shadow-pink-500/30"
                >
                    Comprar
                </Link>
            </div>
        </div>
    );
};

export default MiniCart;
