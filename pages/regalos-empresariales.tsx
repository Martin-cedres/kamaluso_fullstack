import { GetStaticProps } from 'next'
import SeoMeta from '../components/SeoMeta'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function RegalosEmpresarialesPage() {
  // Datos de ejemplo para productos sugeridos
  const suggestedProducts = [
    {
      name: 'Agendas Personalizadas',
      description:
        'Agendas diarias, dos días por página o semanales, con tapa dura o flexible, personalizadas con tu logo y colores corporativos.',
      imageUrl: '/regalo-agenda-empresarial.webp', // Reemplazar con imagen de ejemplo
    },
    {
      name: 'Libretas Corporativas',
      description:
        'Libretas de todos los tamaños, ideales para reuniones, eventos o como merchandising para tus clientes.',
      imageUrl: '/logo.webp', // Reemplazar con imagen de ejemplo
    },
    {
      name: 'Planners y Anotadores',
      description:
        'Organiza a tu equipo con planners semanales o mensuales, completamente brandeados con tu identidad.',
      imageUrl: '/logo.webp', // Reemplazar con imagen de ejemplo
    },
  ]

  const [formData, setFormData] = useState({
    companyName: '',
    yourName: '',
    email: '',
    phone: '',
    productInterest: '',
    quantity: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setResponseMessage('');

    try {
      const res = await fetch('/api/contact-b2b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setResponseMessage(data.message);
        setFormData({
          companyName: '',
          yourName: '',
          email: '',
          phone: '',
          productInterest: '',
          quantity: '',
          message: '',
        });
      } else {
        setStatus('error');
        setResponseMessage(data.message || 'Hubo un error al enviar tu solicitud.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
      setResponseMessage('Hubo un error de conexión. Inténtalo de nuevo más tarde.');
    }
  };

  const faqs = [
    {
      question: '¿Cuál es la cantidad mínima para pedidos empresariales?',
      answer: 'No tenemos un mínimo estricto, pero el precio por unidad mejora significativamente con mayores cantidades. Contáctanos con tu idea y te prepararemos una cotización a medida.',
    },
    {
      question: '¿Qué opciones de personalización ofrecen?',
      answer: 'Podemos personalizar casi todo. Esto incluye añadir tu logo, usar los colores de tu marca, e imprimir diseños personalizados en las tapas.',
    },
    {
      question: '¿Cuál es el proceso para realizar un pedido?',
      answer: 'El proceso es simple: 1) Nos contactas con tu idea. 2) Te enviamos una cotización y una muestra digital para tu aprobación. 3) Producimos tu pedido. 4) Lo enviamos a cualquier parte de Uruguay.',
    },
    {
      question: '¿Cuáles son los tiempos de entrega?',
      answer: 'Los tiempos de entrega varían según la complejidad del diseño, la cantidad solicitada y la época del año. Una vez aprobada la muestra digital, te informaremos el plazo estimado de producción y envío.',
    },
    {
      question: '¿Puedo ver una muestra digital con mi logo antes de confirmar?',
      answer: '¡Sí! Siempre preparamos y enviamos una muestra digital detallada para que puedas ver exactamente cómo quedará tu producto y dar tu aprobación antes de que empecemos la producción.',
    },
    {
      question: '¿Qué métodos de pago aceptan para empresas?',
      answer: 'Aceptamos transferencia bancaria y Mercado Pago. Los detalles se coordinan al confirmar la cotización.',
    },
  ];

  return (
    <>
      <SeoMeta
        title="Regalos Empresariales Personalizados en Uruguay | Kamaluso"
        description="Sorprende a tus clientes y empleados con regalos empresariales únicos. Agendas y libretas personalizadas con tu logo. Cotiza hoy. Envíos a todo Uruguay."
        url="/regalos-empresariales"
      />

      <main className="min-h-screen bg-white text-gray-900 font-sans">
        {/* Hero Section */}
        <section className="bg-gray-50 text-center px-6 py-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            Regalos Empresariales Únicos y Personalizados
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Potencia tu marca y fideliza a tus clientes y empleados con regalos
            de papelería de alta calidad, diseñados exclusivamente para ti.
          </p>
        </section>

        {/* Productos Sugeridos */}
        <section className="px-6 py-16">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Nuestras Soluciones para Empresas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {suggestedProducts.map((product) => (
              <div
                key={product.name}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:shadow-pink-500/50 transition transform hover:-translate-y-1 flex flex-col h-full overflow-hidden border"
              >
                <div className="relative w-full h-64 bg-gray-100">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 767px) 90vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow text-center">
                  <h3 className="font-semibold text-xl mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm flex-grow">
                    {product.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Proceso */}
        <section className="px-6 py-16 bg-gray-50">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Nuestro Proceso Simplificado
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-pink-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Contacto y Cotización</h3>
              <p className="text-sm text-gray-600">
                Nos cuentas tu idea y te preparamos una propuesta a medida.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-pink-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Muestra Digital</h3>
              <p className="text-sm text-gray-600">
                Creamos un diseño digital con tu logo para que apruebes cada
                detalle.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-pink-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Producción</h3>
              <p className="text-sm text-gray-600">
                Manos a la obra. Producimos tu pedido con los más altos
                estándares de calidad.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-pink-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Entrega Nacional</h3>
              <p className="text-sm text-gray-600">
                Enviamos tu pedido a cualquier punto de Uruguay, listo para
                impresionar.
              </p>
            </div>
          </div>
        </section>

        {/* Sección de Preguntas Frecuentes */}
        <section className="px-6 py-16 bg-white">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Preguntas Frecuentes para Empresas
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold mb-4">¿Listo para empezar?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Contáctanos hoy mismo para recibir una cotización sin compromiso y
            descubre cómo podemos ayudarte a destacar con regalos empresariales
            que dejan huella.
          </p>
        </section>

        {/* Formulario de Contacto B2B */}
        <section className="px-6 py-16 bg-gray-50">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Solicita tu Cotización Personalizada
          </h2>
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Nombre de la Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="yourName" className="block text-sm font-medium text-gray-700">
                  Tu Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="yourName"
                  id="yourName"
                  value={formData.yourName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email de Contacto <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="productInterest" className="block text-sm font-medium text-gray-700">
                  Producto de Interés <span className="text-red-500">*</span>
                </label>
                <select
                  name="productInterest"
                  id="productInterest"
                  value={formData.productInterest}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Agendas">Agendas</option>
                  <option value="Libretas">Libretas</option>
                  <option value="Planners">Planners</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Cantidad Estimada <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="quantity"
                  id="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Mensaje (detalla tu idea) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
              {status === 'success' && (
                <p className="mt-3 text-center text-sm font-medium text-green-600">
                  {responseMessage}
                </p>
              )}
              {status === 'error' && (
                <p className="mt-3 text-center text-sm font-medium text-red-600">
                  {responseMessage}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 86400,
  }
}
