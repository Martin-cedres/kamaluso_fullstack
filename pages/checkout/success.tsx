import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Script from 'next/script'
import { useCart } from '../../context/CartContext'

declare global {
  interface Window {
    renderOptIn: () => void;
    gapi: any;
  }
}

const CheckoutSuccessPage = () => {
  const router = useRouter()
  const { clearCart } = useCart()
  const [isValidSession, setIsValidSession] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    if (!router.isReady) return

    const { status, orderId } = router.query

    // Si viene de Mercado Pago con status approved
    if (status === 'approved' || status === 'pending') {
      setIsValidSession(true)

      // Limpiar carrito si venimos del checkout de MP
      if (localStorage.getItem('mp_pending_cart_clear') === 'true') {
        clearCart()
        localStorage.removeItem('mp_pending_cart_clear')
      }
    } else if (orderId) {
      // Caso genérico si decidimos enviar a success con orderId
      setIsValidSession(true)
    } else {
      // Si entra directo sin parámetros, quizás redirigir o mostrar genérico
      setIsValidSession(false)
    }

    // Fetch order data for Google Reviews if we have an orderId
    if (orderId && typeof orderId === 'string') {
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.message) {
            setOrderData(data)
          }
        })
        .catch(err => console.error('Error fetching order for Google Reviews:', err))
    }

  }, [router.isReady, router.query, clearCart])

  // Function to initialize Google Survey Opt-in
  useEffect(() => {
    if (orderData && typeof window !== 'undefined') {
      window.renderOptIn = function () {
        if (window.gapi) {
          window.gapi.load('surveyoptin', function () {
            // Calculate estimated delivery date (7 days from now)
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 7);
            const formattedDate = deliveryDate.toISOString().split('T')[0];

            window.gapi.surveyoptin.render({
              "merchant_id": 5687827854,
              "order_id": orderData.orderId,
              "email": orderData.email,
              "delivery_country": "UY",
              "estimated_delivery_date": formattedDate,
              "products": orderData.items?.map((item: any) => ({ "gtin": item.gtin || "" })) || []
            });
          });
        }
      };

      // If gapi is already loaded and surveyoptin is ready, we could call it, 
      // but usually the script's onload=renderOptIn handles it.
    }
  }, [orderData]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 flex items-center justify-center">
      <Script
        src="https://apis.google.com/js/platform.js?onload=renderOptIn"
        async
        defer
      />
      <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-lg w-full">
        {isValidSession ? (
          <>
            <h1 className="text-3xl font-bold text-green-600">
              ¡Gracias por tu compra!
            </h1>
            <p className="text-gray-700 mt-3">
              Tu pago ha sido procesado correctamente.
              Hemos enviado un correo electrónico con los detalles de tu pedido.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-800">
              Estado del Pedido
            </h1>
            <p className="text-gray-700 mt-3">
              Si acabas de realizar un pago, tu orden está siendo procesada.
            </p>
          </>
        )}

        <div className="mt-6">
          <Link href="/" passHref>
            <a className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition">
              Volver a la tienda
            </a>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default CheckoutSuccessPage