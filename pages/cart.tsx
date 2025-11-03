import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCart, getCartItemId } from '../context/CartContext'

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartCount,
    appliedCoupon,
    setAppliedCoupon,
  } = useCart()
  const router = useRouter()

  const [couponCode, setCouponCode] = useState(appliedCoupon?.code || '')
  const [couponMessage, setCouponMessage] = useState('')

  const discountAmount = appliedCoupon?.discountAmount || 0

  const total = cartItems.reduce(
    (sum, item) => sum + item.precio * item.quantity,
    0,
  )
  const finalTotal = total - discountAmount

  useEffect(() => {
    if (appliedCoupon) {
      setCouponMessage(`Cupón ${appliedCoupon.code} aplicado con éxito!`)
    } else {
      setCouponMessage('')
    }
  }, [appliedCoupon])

  const applyCoupon = async () => {
    setCouponMessage('')
    setAppliedCoupon(null)

    try {
      const res = await fetch('/api/coupons/aplicar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          cartItems: cartItems.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
            price: item.precio,
            category: item.categoria,
          })),
          cartTotal: total,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setAppliedCoupon(null)
        setCouponMessage(data.message || 'Error al aplicar el cupón.')
        return
      }

      setAppliedCoupon({
        code: data.couponCode,
        discountAmount: data.discountAmount,
      })
      setCouponMessage(data.message || 'Cupón aplicado con éxito!')
    } catch (error) {
      console.error('Error applying coupon:', error)
      setAppliedCoupon(null)
      setCouponMessage('Error de conexión al aplicar el cupón.')
    }
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-10">
            Tu Carrito de Compras
          </h1>

          {cartCount === 0 ? (
            <div className="text-center">
              <p className="text-gray-500 text-xl mb-6">
                Tu carrito está vacío.
              </p>
              <Link
                href="/"
                className="bg-pink-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:bg-pink-600 transition"
              >
                Seguir comprando
              </Link>
            </div>
          ) : (
            <div>
              {/* Cart Items */}
              <div className="space-y-6">
                {cartItems.map((item) => {
                  const cartItemId = getCartItemId(item)
                  return (
                    <div
                      key={cartItemId}
                      className="flex items-center gap-6 bg-white p-4 rounded-2xl shadow-md"
                    >
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden">
                        <Image
                          src={item.imageUrl || '/placeholder.png'}
                          alt={item.nombre}
                          fill
                          sizes="96px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className="flex-grow">
                        <h2 className="font-semibold text-lg">{item.nombre}</h2>
                        {item.finish && (
                          <p className="text-sm text-gray-500">
                            Acabado: {item.finish}
                          </p>
                        )}
                        <p className="text-gray-600">$U {item.precio}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            updateQuantity(cartItemId, item.quantity - 1)
                          }
                          className="px-3 py-1 bg-gray-200 rounded-md"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(cartItemId, item.quantity + 1)
                          }
                          className="px-3 py-1 bg-gray-200 rounded-md"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold w-24 text-right">
                        $U {(item.precio * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(cartItemId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Cart Summary */}
              <div className="mt-10 flex justify-end">
                <div className="bg-white p-6 rounded-2xl shadow-md w-full sm:w-auto">
                  <h2 className="text-2xl font-semibold mb-4">
                    Resumen del Pedido
                  </h2>

                  {/* Coupon Input */}
                  <div className="mb-4">
                    <label
                      htmlFor="coupon"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ¿Tienes un cupón?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="coupon"
                        className="flex-grow border border-gray-300 rounded-md shadow-sm p-2"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Ingresa tu código"
                      />
                      <button
                        onClick={applyCoupon}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                      >
                        Aplicar
                      </button>
                    </div>
                    {couponMessage && (
                      <p
                        className={`mt-2 text-sm ${discountAmount > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {couponMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between text-lg mb-2">
                    <span>Subtotal</span>
                    <span className="font-bold">$U {total.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-lg text-green-600 mb-2">
                      <span>Descuento Cupón</span>
                      <span className="font-bold">
                        -$U {discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Total Final</span>
                    <span>$U {finalTotal.toFixed(2)}</span>
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
  )
}
