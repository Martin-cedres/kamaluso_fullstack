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

                  {/* --- Selector Visual de Método de Envío --- */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Método de Envío
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(shippingOptions).map(([key, text]) => (
                        <div
                          key={key}
                          onClick={() => setShippingMethod(key)}
                          className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${shippingMethod === key
                            ? 'border-pink-500 bg-pink-50/50 shadow-sm'
                            : 'border-gray-200 hover:border-pink-200 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            {/* Icon Mapping */}
                            {key.includes('dac') && <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${shippingMethod === key ? 'text-pink-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>}
                            {key.includes('correo') && <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${shippingMethod === key ? 'text-pink-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            {key.includes('pickup') && <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${shippingMethod === key ? 'text-pink-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}

                            {/* Radio Circle Indicator */}
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${shippingMethod === key ? 'border-pink-500' : 'border-gray-300'}`}>
                              {shippingMethod === key && <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />}
                            </div>
                          </div>
                          <span className={`font-medium text-sm ${shippingMethod === key ? 'text-pink-900' : 'text-gray-700'}`}>
                            {text}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      El costo del envío es a cargo del comprador y se abona al recibir/retirar.
                    </p>
                  </div>

                  {shippingMethod === 'dac_domicilio' && (
                    <div className="bg-gray-50 p-4 rounded-xl space-y-4 animate-fadeIn">
                      {/* Campos de Dirección (Igual que antes pero encapsulados para orden visual) */}
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required={shippingMethod === 'dac_domicilio'} placeholder="Calle, número, apto, etc." className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 transition-shadow" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
                          <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} required={shippingMethod === 'dac_domicilio'} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 transition-shadow" />
                        </div>
                        <div>
                          <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
                          <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required={shippingMethod === 'dac_domicilio'} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 transition-shadow">
                            {departments.map((dep) => (<option key={dep} value={dep}>{dep}</option>))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {(shippingMethod === 'correo' || shippingMethod === 'dac_agencia') && (
                    <div className="bg-gray-50 p-4 rounded-xl animate-fadeIn">
                      <label htmlFor="shippingNotes" className="block text-sm font-medium text-gray-700 mb-1">
                        ¿En qué sucursal/agencia retiras?
                      </label>
                      <textarea id="shippingNotes" value={shippingNotes} onChange={(e) => setShippingNotes(e.target.value)} rows={2} placeholder={getNotesPlaceholder()} required className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 transition-shadow" />
                    </div>
                  )}

                  {/* --- Selector Visual de Método de Pago --- */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Método de Pago
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {availablePaymentOptions().map(([key, text]) => (
                        <div
                          key={key}
                          onClick={() => setPaymentMethod(key)}
                          className={`flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${paymentMethod === key
                            ? 'border-pink-500 bg-pink-50/50 shadow-sm'
                            : 'border-gray-200 hover:border-pink-200 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex-shrink-0 mr-4">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === key ? 'border-pink-500' : 'border-gray-300'}`}>
                              {paymentMethod === key && <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <span className={`font-medium block ${paymentMethod === key ? 'text-pink-900' : 'text-gray-900'}`}>
                              {text}
                            </span>
                            {key === 'mercado_pago_online' && (
                              <span className="text-xs text-orange-600 font-medium inline-block bg-orange-100 px-2 py-0.5 rounded mt-1">
                                +10% recargo
                              </span>
                            )}
                          </div>
                          {/* Payment Icons */}
                          <div className="text-gray-400 ml-2">
                            {key === 'mercado_pago_online' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Instrucciones de Pago dinámicas */}
                    {(paymentMethod === 'brou' || paymentMethod === 'oca_blue' || paymentMethod === 'mi_dinero' || paymentMethod === 'prex' || paymentMethod === 'abitab' || paymentMethod === 'red_pagos') && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-3 animate-fadeIn">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-sm text-blue-800">
                          Una vez confirmado el pedido, recibirás un correo con los datos de cuenta para transferir. El pedido se procesa al enviar el comprobante.
                        </p>
                      </div>
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
