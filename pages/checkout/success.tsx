import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar';

const CheckoutSuccessPage = () => {
  const router = useRouter();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState('');

  useEffect(() => {
    const { payment_id, status: mpStatus } = router.query;

    if (!payment_id || !mpStatus) {
      return;
    }

    if (status !== 'processing') {
      return;
    }

    if (mpStatus === 'approved') {
      const formDataString = localStorage.getItem('checkout_form_data');
      if (!formDataString) {
        const supportError = 'No se pudieron recuperar los datos del formulario. Por favor, contacta a soporte.';
        setError(supportError);
        setStatus('error');
        return;
      }

      try {
        const formData = JSON.parse(formDataString);
        const cartItems = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
        const total = cartItems.reduce((sum: number, item: any) => sum + item.precio * item.quantity, 0);

        const payload = {
          ...formData,
          items: cartItems,
          total,
          paymentId: payment_id,
        };

        fetch('/api/orders/confirm-mp-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              throw new Error(err.message || `Error del servidor: ${response.statusText}`);
            });
          }
          return response.json();
        })
        .then(data => {
          if (data.orderId) {
            setStatus('success');
            clearCart();
            localStorage.removeItem('checkout_form_data');
          localStorage.removeItem('shoppingCart'); // Limpiar también los items guardados
          } else {
            throw new Error(data.message || 'Error al confirmar el pedido.');
          }
        })
        .catch(err => {
          setError(`Hubo un problema al confirmar tu orden: ${err.message}`);
          setStatus('error');
        });
      } catch (parseError: any) {
        setError(`Error al procesar los datos del formulario: ${parseError.message}. Por favor, contacta a soporte.`);
        setStatus('error');
      }

    } else {
      setError(`El pago fue ${mpStatus}. Por favor, intenta de nuevo.`);
      setStatus('error');
    }

  }, [router.query, status, clearCart]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-lg w-full">
          {status === 'processing' && (
            <>
              <h1 className="text-2xl font-semibold text-gray-800">Procesando tu pago...</h1>
              <p className="text-gray-600 mt-2">Por favor, espera un momento mientras confirmamos tu orden.</p>
              {/* Spinner o animación de carga */}
              <div className="mt-6 w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </>
          )}
          {status === 'success' && (
            <>
              <h1 className="text-3xl font-bold text-green-600">¡Gracias por tu compra!</h1>
              <p className="text-gray-700 mt-3">Tu pedido ha sido confirmado exitosamente. Recibirás un correo electrónico con los detalles en breve.</p>
              <button onClick={() => router.push('/')} className="mt-6 bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition">
                Volver a la tienda
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <h1 className="text-3xl font-bold text-red-600">Hubo un problema</h1>
              <p className="text-gray-700 mt-3">{error || 'No se pudo procesar tu pago.'}</p>
              <button onClick={() => router.push('/checkout')} className="mt-6 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition">
                Intentar de nuevo
              </button>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default CheckoutSuccessPage;
