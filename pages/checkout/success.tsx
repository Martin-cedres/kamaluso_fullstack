import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link' // Import Link
import { useCart } from '../../context/CartContext'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

type OrderStatus = 'processing' | 'success' | 'error' | 'idle'

const CheckoutSuccessPage = () => {
  const router = useRouter()
  const { clearCart } = useCart()
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('processing')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const createOrder = async () => {
      // Get data from Mercado Pago redirect
      const { status, payment_id } = router.query

      // Only proceed if this is a successful payment.
      if (status !== 'approved' || !payment_id) {
        setOrderStatus('idle') // Not a valid success redirect, do nothing.
        return
      }

      // Get data from localStorage
      const formDataString = localStorage.getItem('checkout_form_data')
      if (!formDataString) {
        // This can happen if the user refreshes the page after the order is created.
        // It's not an error, just means the work is already done.
        setOrderStatus('success')
        return
      }

      try {
        const formData = JSON.parse(formDataString)

        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          shippingDetails: formData.shippingDetails,
          items: formData.items,
          total: formData.total,
          paymentMethod: formData.paymentMethod,
          couponCode: formData.appliedCoupon?.code,
          paymentDetails: {
            paymentId: payment_id,
            status: status,
            method: 'Mercado Pago',
            tempOrderId: formData.tempOrderId, // Send the temp ID for reference
          },
        }

        const response = await fetch('/api/orders/crear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Error al crear el pedido.')
        }

        // Order created successfully!
        setOrderStatus('success')
        toast.success('¡Pedido creado con éxito!')

        // Clean up
        clearCart()
        localStorage.removeItem('checkout_form_data')
        localStorage.removeItem('shoppingCart') // Just in case
      } catch (error: any) {
        console.error('Failed to create order:', error)
        setErrorMessage(error.message)
        setOrderStatus('error')
        toast.error(`Error al finalizar tu pedido: ${error.message}`)
      }
    }

    // Make sure router query params are available before running
    if (router.isReady) {
      createOrder()
    }
  }, [router.isReady, router.query, clearCart])

  const renderContent = () => {
    switch (orderStatus) {
      case 'processing':
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-800">
              Procesando tu pedido...
            </h1>
            <p className="text-gray-700 mt-3">
              Estamos finalizando los detalles y creando tu orden. Por favor, no
              refresques la página.
            </p>
          </>
        )
      case 'success':
        return (
          <>
            <h1 className="text-3xl font-bold text-green-600">
              ¡Gracias por tu compra!
            </h1>
            <p className="text-gray-700 mt-3">
              Hemos recibido tu pedido y lo estamos procesando. Recibirás un
              correo electrónico de confirmación en breve.
            </p>
          </>
        )
      case 'error':
        return (
          <>
            <h1 className="text-3xl font-bold text-red-600">
              Hubo un error al crear tu pedido
            </h1>
            <p className="text-gray-700 mt-3">
              Tu pago fue procesado, pero tuvimos un problema al guardar tu
              pedido en nuestro sistema.
            </p>
            <p className="text-gray-600 mt-2">
              Por favor, contáctanos con el siguiente detalle para que podamos
              resolverlo: {errorMessage}
            </p>
          </>
        )
      default:
        return null // Or a generic message if needed
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-lg w-full">
          {renderContent()}
          <div className="mt-6">
            <Link href="/" passHref>
              <a className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition">
                Volver a la tienda
              </a>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

export default CheckoutSuccessPage