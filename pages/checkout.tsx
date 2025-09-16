import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const departments = [
  "Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno", "Flores", 
  "Florida", "Lavalleja", "Maldonado", "Montevideo", "Paysandú", 
  "Río Negro", "Rivera", "Rocha", "Salto", "San José", "Soriano", 
  "Tacuarembó", "Treinta y Tres"
];

const paymentOptions = {
  brou: "Transferencia Bancaria BROU",
  qr_mercadopago: "QR Mercado Pago",
  oca_blue: "Depósito OCA Blue",
  mi_dinero: "Mi Dinero",
  prex: "Prex",
  abitab: "Giro ABITAB",
  red_pagos: "Giro RED PAGOS",
  pago_en_local: "Pago en Local",
  mercado_pago_online: "Tarjeta de Crédito/Débito (Mercado Pago)",
};

export default function CheckoutPage() {
  const { cartItems, clearCart, cartCount, appliedCoupon } = useCart();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [department, setDepartment] = useState(departments[0]);
  const [shippingMethod, setShippingMethod] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('brou');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const total = subtotal - couponDiscount;

  useEffect(() => {
    if (shippingMethod === 'pickup') {
      setPaymentMethod('pago_en_local');
    } else if (paymentMethod === 'pago_en_local') {
      setPaymentMethod('brou');
    }
  }, [shippingMethod]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartCount === 0) {
      alert('Tu carrito está vacío.');
      router.push('/');
      return;
    }

    setIsSubmitting(true);

    if (paymentMethod === 'mercado_pago_online') {
      try {
        const response = await fetch('/api/payments/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cartItems }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create payment preference');
        }

        const formData = { name, email, phone, shippingMethod, address, city, department, notes, paymentMethod, appliedCoupon };
        localStorage.setItem('checkout_form_data', JSON.stringify(formData));
        
        router.push(data.init_point);

      } catch (error: any) {
        console.error('Mercado Pago checkout error:', error);
        alert(`Hubo un error al iniciar el pago con Mercado Pago:\n\n${error.message}`);
        setIsSubmitting(false);
      }
      return;
    }

    const fullAddress = shippingMethod === 'delivery' ? `${address}, ${city}, ${department}` : 'Retiro en Local';
    const payload = {
      name, email, phone, shippingMethod, address: fullAddress, city, notes,
      items: cartItems,
      subtotal, couponDiscount, total, paymentMethod,
      appliedCoupon: appliedCoupon ? { code: appliedCoupon.code, discountAmount: appliedCoupon.discountAmount } : undefined,
    };

    try {
      const response = await fetch('/api/orders/crear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
      });

      if (response.ok) {
          alert('¡Pedido realizado con éxito! Recibirás un correo con los detalles.');
          clearCart();
          router.push('/');
      } else {
          const errorData = await response.json();
          alert(`Hubo un error al procesar tu pedido: ${errorData.message || 'Por favor, inténtalo de nuevo.'}`);
          setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Hubo un error de conexión. Por favor, inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-10">Finalizar Compra</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-6 rounded-2xl shadow-md h-fit">
              <h2 className="text-2xl font-semibold mb-4">Resumen del Pedido</h2>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.nombre} <span className="text-gray-500">x {item.quantity}</span></p>
                      {item.finish && <p className="text-sm text-gray-500">Acabado: {item.finish}</p>}
                    </div>
                    <p className="text-gray-700">$U {item.precio * item.quantity}</p>
                  </div>
                ))}
              </div>
              <hr className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-md"><span>Subtotal</span><span>$U {subtotal.toFixed(2)}</span></div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-md text-green-600"><span>Descuento Cupón</span><span>-$U {couponDiscount.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>$U {total.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Tus Datos</h2>
              <form onSubmit={handleCheckout}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método de Envío</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <button type="button" onClick={() => setShippingMethod('delivery')} className={`flex-1 px-4 py-2 text-sm rounded-l-md border ${shippingMethod === 'delivery' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-700 border-gray-300'}`}>
                        Envío a Domicilio
                      </button>
                      <button type="button" onClick={() => setShippingMethod('pickup')} className={`flex-1 px-4 py-2 text-sm rounded-r-md border border-l-0 ${shippingMethod === 'pickup' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-700 border-gray-300'}`}>
                        Retiro en Local
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre y Apellido</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Número de Teléfono</label>
                    <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                  </div>

                  {shippingMethod === 'delivery' && (
                    <>
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección de Envío</label>
                        <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required={shippingMethod === 'delivery'} placeholder="Calle, número, apto, etc." className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                      </div>
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
                        <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} required={shippingMethod === 'delivery'} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                      </div>
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
                        <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required={shippingMethod === 'delivery'} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                          {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas del Pedido (opcional)</label>
                    <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                    <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                      {shippingMethod === 'pickup' ? (
                        <option value="pago_en_local">Pago en Local</option>
                      ) : (
                        Object.entries(paymentOptions).filter(([key]) => key !== 'pago_en_local').map(([key, text]) => (
                          <option key={key} value={key}>{text}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full mt-6 bg-pink-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:bg-pink-600 transition disabled:bg-gray-400" disabled={cartCount === 0 || isSubmitting}>
                  {isSubmitting ? 'Procesando...' : (paymentMethod === 'mercado_pago_online' ? 'Pagar con Mercado Pago' : 'Confirmar Pedido')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
