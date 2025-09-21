import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar';

const CheckoutSuccessPage = () => {
  const router = useRouter();
  const { clearCart } = useCart();

  useEffect(() => {
    // Limpia el carrito y los datos del formulario una vez que el usuario llega a esta página.
    clearCart();
    localStorage.removeItem('checkout_form_data');
    localStorage.removeItem('shoppingCart');
  }, [clearCart]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-lg w-full">
          <h1 className="text-3xl font-bold text-green-600">¡Gracias por tu compra!</h1>
          <p className="text-gray-700 mt-3">
            Hemos recibido tu pedido y lo estamos procesando. Recibirás un correo electrónico de confirmación en breve una vez que el pago sea aprobado.
          </p>
          <button 
            onClick={() => router.push('/')} 
            className="mt-6 bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition"
          >
            Volver a la tienda
          </button>
        </div>
      </main>
    </>
  );
};

export default CheckoutSuccessPage;

