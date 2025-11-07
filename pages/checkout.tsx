import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

const departments = [
  'Artigas',
  'Canelones',
  'Cerro Largo',
  'Colonia',
  'Durazno',
  'Flores',
  'Florida',
  'Lavalleja',
  'Maldonado',
  'Montevideo',
  'Paysandú',
  'Río Negro',
  'Rivera',
  'Rocha',
  'Salto',
  'San José',
  'Soriano',
  'Tacuarembó',
  'Treinta y Tres',
]

const paymentOptions = {
  brou: 'Transferencia Bancaria BROU',
  oca_blue: 'Depósito OCA Blue',
  mi_dinero: 'Mi Dinero',
  prex: 'Prex',
  abitab: 'Giro ABITAB',
  red_pagos: 'Giro RED PAGOS',
  pago_en_local: 'Pago en Local',
  pago_efectivo_local: 'Pago en Efectivo en Local',
  mercado_pago_online: 'Tarjeta de Crédito/Débito (Mercado Pago) (+10%)',
}

const shippingOptions = {
  dac_domicilio: 'DAC - Envío a Domicilio',
  dac_agencia: 'DAC - Retiro en Agencia',
  correo: 'Correo Uruguayo - Retiro en Sucursal',
  pickup: 'Retiro en Local (San José de Mayo)',
}

export default function CheckoutPage() {
  const { cartItems, clearCart, cartCount, appliedCoupon } = useCart()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [department, setDepartment] = useState(departments[0])
  const [shippingMethod, setShippingMethod] = useState('dac_domicilio')
  const [shippingNotes, setShippingNotes] = useState('')
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('brou');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surcharge, setSurcharge] = useState(0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.precio * item.quantity,
    0,
  );
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const baseTotal = subtotal - couponDiscount;

  useEffect(() => {
    if (paymentMethod === 'mercado_pago_online') {
      const calculatedSurcharge = baseTotal * 0.10;
      setSurcharge(calculatedSurcharge);
    } else {
      setSurcharge(0);
    }
  }, [paymentMethod, baseTotal]);

  const total = baseTotal + surcharge;

  const getShippingDetails = () => {
    let details = {
      method: shippingOptions[shippingMethod as keyof typeof shippingOptions],
      address: '',
      notes: shippingNotes,
    }

    switch (shippingMethod) {
      case 'dac_domicilio':
        details.address = `${address}, ${city}, ${department}`
        break
      case 'dac_agencia':
      case 'correo':
        details.address = `Retiro en agencia/sucursal. Detalles en notas.`
        break
      case 'pickup':
        details.address = 'Retiro en Local'
        break
    }
    return details
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cartCount === 0) {
      toast.error('Tu carrito está vacío.')
      router.push('/')
      return
    }

    setIsSubmitting(true)

    const shippingDetails = getShippingDetails()

    if (paymentMethod === 'mercado_pago_online') {
      try {
        // Generate a temporary order ID for Mercado Pago's external_reference
        const tempOrderId = `kamaluso-mp-${Date.now()}`

        const response = await fetch('/api/payments/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: tempOrderId,
            items: cartItems,
            paymentMethod: paymentMethod, // Enviar el método de pago
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create payment preference')
        }

        const formData = {
          name,
          email,
          phone,
          shippingDetails,
          paymentMethod,
          appliedCoupon,
          notes: orderNotes, // Añadir notas del pedido
          // Store the temp ID to create the real order on the success page
          tempOrderId: tempOrderId,
          // Add cart items and total for order creation on success page
          items: cartItems,
          total: total,
        }
        localStorage.setItem('checkout_form_data', JSON.stringify(formData))

        router.push(data.init_point)
      } catch (error: any) {
        console.error('Mercado Pago checkout error:', error)
        toast.error(
          `Hubo un error al iniciar el pago con Mercado Pago: ${error.message}`,
        )
        setIsSubmitting(false)
      }
      return
    }

    const payload = {
      name,
      email,
      phone,
      shippingDetails,
      items: cartItems,
      total, // This total is from the client, the server will recalculate
      paymentMethod,
      notes: orderNotes, // Añadir notas del pedido
      couponCode: appliedCoupon?.code, // Send only the code
    }

    try {
      const response = await fetch('/api/orders/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(
          '¡Pedido realizado con éxito! Recibirás un correo con los detalles.',
        )
        clearCart()
        router.push('/')
      } else {
        const errorData = await response.json()
        toast.error(
          `Hubo un error al procesar tu pedido: ${errorData.message || 'Por favor, inténtalo de nuevo.'}`,
        )
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Hubo un error de conexión. Por favor, inténtalo de nuevo.')
      setIsSubmitting(false)
    }
  }

  const getNotesPlaceholder = () => {
    if (shippingMethod === 'correo')
      return 'Indica la dirección de la sucursal de Correo Uruguayo donde retirarás.'
    if (shippingMethod === 'dac_agencia')
      return 'Indica en que agencia retiras.'
    return 'Instrucciones especiales, aclaraciones, etc.'
  }

  const availablePaymentOptions = () => {
    if (shippingMethod === 'pickup') {
      return Object.entries(paymentOptions)
    }
    return Object.entries(paymentOptions).filter(
      ([key]) => key !== 'pago_en_local' && key !== 'pago_efectivo_local',
    )
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-10">
            Finalizar Compra
          </h1>

          {/* --- Barra de Progreso --- */}
          <div className="w-full max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-pink-500 font-semibold">
                <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center">1</div>
                <span className="ml-2">Tus Datos</span>
              </div>
              <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              <div className="flex items-center text-gray-500">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center">2</div>
                <span className="ml-2">Envío y Pago</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-6 rounded-2xl shadow-md h-fit">
              <h2 className="text-2xl font-semibold mb-4">
                Resumen del Pedido
              </h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.nombre}{' '}
                        <span className="text-gray-500">x {item.quantity}</span>
                      </p>
                      {item.finish && (
                        <p className="text-sm text-gray-500">
                          Acabado: {item.finish}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-700">
                      $U {item.precio * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
              <hr className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-md">
                  <span>Subtotal</span>
                  <span>$U {subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-md text-green-600">
                    <span>Descuento Cupón</span>
                    <span>-$U {couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {surcharge > 0 && (
                  <div className="flex justify-between text-md text-orange-600">
                    <span>Recargo por Mercado Pago (10%)</span>
                    <span className="flex items-center">
                      +$U {surcharge.toFixed(2)}
                      <span className="ml-2 text-xs text-gray-500" title="Esta es la comisión que nos cobra el procesador de pagos.">
                        (i)
                      </span>
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>$U {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Tus Datos</h2>
              <form onSubmit={handleCheckout}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre y Apellido
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Número de Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="shippingMethod"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Método de Envío
                    </label>
                    <select
                      id="shippingMethod"
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    >
                      {Object.entries(shippingOptions).map(([key, text]) => (
                        <option key={key} value={key}>
                          {text}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      El costo del envío es a cargo del comprador y se abona al
                      recibir/retirar el paquete.
                    </p>
                  </div>

                  {shippingMethod === 'dac_domicilio' && (
                    <>
                      <div>
                        <label
                          htmlFor="address"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Dirección de Envío
                        </label>
                        <input
                          type="text"
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required={shippingMethod === 'dac_domicilio'}
                          placeholder="Calle, número, apto, etc."
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Ciudad
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required={shippingMethod === 'dac_domicilio'}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="department"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Departamento
                        </label>
                        <select
                          id="department"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          required={shippingMethod === 'dac_domicilio'}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        >
                          {departments.map((dep) => (
                            <option key={dep} value={dep}>
                              {dep}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {(shippingMethod === 'correo' ||
                    shippingMethod === 'dac_agencia') && (
                    <div>
                      <label
                        htmlFor="shippingNotes"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Notas de Envío
                      </label>
                      <textarea
                        id="shippingNotes"
                        value={shippingNotes}
                        onChange={(e) => setShippingNotes(e.target.value)}
                        rows={3}
                        placeholder={getNotesPlaceholder()}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Método de Pago
                    </label>
                    <select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    >
                      {availablePaymentOptions().map(([key, text]) => (
                        <option key={key} value={key}>
                          {text}
                        </option>
                      ))}
                    </select>
                    {/* Dynamic Payment Instructions */}
                    {(paymentMethod === 'brou' ||
                      paymentMethod === 'oca_blue' ||
                      paymentMethod === 'mi_dinero' ||
                      paymentMethod === 'prex' ||
                      paymentMethod === 'abitab' ||
                      paymentMethod === 'red_pagos') && (
                      <p className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                        Recibirás las instrucciones para completar el pago en tu correo electrónico una vez que confirmes el pedido.
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="orderNotes"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Notas Adicionales para tu Pedido (opcional)
                    </label>
                    <textarea
                      id="orderNotes"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={3}
                      placeholder="¿Alguna aclaración sobre tu pedido? Ej: la tapa la quiero sin elástico, el diseño es para un regalo, etc."
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-6 bg-pink-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:bg-pink-600 transition disabled:bg-gray-400"
                  disabled={cartCount === 0 || isSubmitting}
                >
                  {isSubmitting
                    ? 'Procesando...'
                    : paymentMethod === 'mercado_pago_online'
                      ? 'Pagar con Mercado Pago'
                      : 'Confirmar Pedido'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
