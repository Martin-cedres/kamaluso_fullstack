import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartCount } = useCart();
  const router = useRouter();

  const total = cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-10">Tu Carrito de Compras</h1>

          {cartCount === 0 ? (
            <div className="text-center">
              <p className="text-gray-500 text-xl mb-6">Tu carrito está vacío.</p>
              <Link href="/" className="bg-pink-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:bg-pink-600 transition">
                Seguir comprando
              </Link>
            </div>
          ) : (
            <div>
              {/* Cart Items */}
              <div className="space-y-6">
                {cartItems.map(item => (
                  <div key={item._id} className="flex items-center gap-6 bg-white p-4 rounded-2xl shadow-md">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden">
                      <Image
                        src={item.imageUrl || '/placeholder.png'}
                        alt={item.nombre}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="flex-grow">
                      <h2 className="font-semibold text-lg">{item.nombre}</h2>
                      <p className="text-gray-600">$U {item.precio}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-1 bg-gray-200 rounded-md">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-1 bg-gray-200 rounded-md">+</button>
                    </div>
                    <p className="font-semibold w-24 text-right">$U {(item.precio * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700">
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="mt-10 flex justify-end">
                <div className="bg-white p-6 rounded-2xl shadow-md w-full sm:w-auto">
                  <h2 className="text-2xl font-semibold mb-4">Resumen del Pedido</h2>
                  <div className="flex justify-between text-lg">
                    <span>Total</span>
                    <span className="font-bold">$U {total.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => router.push('/checkout')}
                    className="w-full mt-6 bg-pink-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:bg-pink-600 transition"
                  >
                    Proceder al Pago
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
