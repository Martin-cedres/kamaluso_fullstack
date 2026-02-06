import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'

const CheckoutSuccessPage = () => {
  const router = useRouter()
  const { clearCart } = useCart()
  const [isValidSession, setIsValidSession] = useState(false)

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

  }, [router.isReady, router.query, clearCart])

  return (
    <main className="min-h-screen bg-gray-50 px-6 flex items-center justify-center">
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