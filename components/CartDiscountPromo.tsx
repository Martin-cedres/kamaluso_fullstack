import React from 'react';
import { useCart } from '../context/CartContext';

const CartDiscountPromo = () => {
    const { cartCount, cartItems, discountAmount, totalBeforeDiscount } = useCart();

    // Estrategia: "Agregá otro y ganá 10% OFF"
    // Si hay 0 items: No mostrar nada (o mensaje genérico "Llevate un 10% OFF comprando 2 productos")
    // Si hay 1 item: Mostrar incentivo fuerte.
    // Si hay 2+ items: Mostrar éxito.

    if (cartCount === 0) return null;

    const isDiscountActive = cartCount >= 2;
    const discountPercentage = 10;

    // Calcular cuánto se ahorraría si agregara otro producto (aprox, basado en el item actual)
    const currentItemPrice = cartItems.length > 0 ? cartItems[0].precio : 0;
    const potentialSaving = Math.round((totalBeforeDiscount + currentItemPrice) * (discountPercentage / 100));

    return (
        <div className={`p-4 mb-4 rounded-xl border text-center transition-all duration-500 transform ${isDiscountActive ? 'bg-green-50 border-green-200' : 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-100'}`}>

            {/* Estado 1: Incentivo (Falta 1 producto) */}
            {!isDiscountActive && (
                <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl">🎁</span>
                        <h4 className="font-bold text-gray-800">¡Desbloqueá 10% OFF!</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        Agregá <span className="font-bold text-pink-600">1 producto más</span> y obtené un 10% de descuento en TODO tu pedido.
                    </p>
                    {/* Progress Bar (50%) */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                        <div className="bg-pink-500 h-2.5 rounded-full w-1/2 animate-pulse"></div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Te faltan solo 1 unidad
                    </p>
                </div>
            )}

            {/* Estado 2: Éxito (Descuento Aplicado) */}
            {isDiscountActive && (
                <div className="animate-bounce-in">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-2xl">🎉</span>
                        <h4 className="font-bold text-green-700">¡Genial! 10% OFF Aplicado</h4>
                    </div>
                    <p className="text-sm text-green-600">
                        Ahorraste <span className="font-bold">${discountAmount.toFixed(2)}</span> en esta compra.
                    </p>
                    {/* Progress Bar (100%) */}
                    <div className="w-full bg-green-200 rounded-full h-2.5 mt-3 overflow-hidden">
                        <div className="bg-green-500 h-2.5 rounded-full w-full"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartDiscountPromo;
