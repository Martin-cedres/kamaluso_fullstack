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
      value: 'Agendas', // Valor para el select
      description:
        'Agendas diarias, dos días por página o semanales. Tapas duras o flexibles, 100% personalizables con tu logo, colores y valores de marca.',
      imageUrl: '/regalo-agenda-empresarial.webp', // Reemplazar con imagen de ejemplo
      features: ['Logo en tapa', 'Insertos publicitarios', 'Elástico de cierre'],
    },
    {
      name: 'Libretas Corporativas',
      value: 'Libretas', // Valor para el select
      description:
        'Libretas versátiles para eventos, onboarding o merchandising. Disponibles en A5, A6 y medidas especiales.',
      imageUrl: '/logo.webp', // Reemplazar con imagen de ejemplo
      features: ['Tapa full color', 'Hojas rayadas, lisas o punteadas', 'Elástico de cierre'],
    },
    {
      name: 'Planners y Anotadores',
      value: 'Planners', // Valor para el select
      description:
        'Herramientas de organización que tus clientes usarán todos los días. Mantén tu marca presente en sus escritorios.',
      imageUrl: '/logo.webp', // Reemplazar con imagen de ejemplo
      features: ['Diseño de hojas exclusivo', 'Encolados o anillados', 'Imán para heladera opcional'],
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

  const handleProductSelect = (productValue: string) => {
    setFormData({ ...formData, productInterest: productValue });
    const formElement = document.getElementById('contacto');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
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
      answer: '¡No tenemos mínimo de compra! Puedes solicitar desde una única unidad personalizada. Por supuesto, ofrecemos precios especiales por volumen para cantidades mayores.',
    },
    {
      question: '¿Qué opciones de personalización ofrecen?',
      answer: 'Ofrecemos personalización completa de tapas con tu diseño. Para el interior, puedes elegir entre nuestros modelos de agendas (semanales, diarias, dos días por página), libretas (rayadas, lisas, punteadas) o enviarnos tu propio diseño exclusivo.',
    },
    {
      question: '¿Hacen envíos a todo el país?',
      answer: 'Sí, enviamos a todo el país por la agencia de tu preferencia. Nosotros llevamos el pedido hasta la agencia sin costo; tú solo abonas el costo del envío al recibirlo. También puedes retirar tu pedido en nuestro taller en San José de Mayo (Calle Massini 136).',
    },
    {
      question: '¿Cuál es el tiempo de producción?',
      answer: 'El tiempo de producción depende directamente del volumen del pedido. Para pedidos pequeños es rápido, mientras que volúmenes mayores requieren más tiempo. Al cotizar te daremos una fecha estimada precisa.',
    },
    {
      question: '¿Puedo ver una muestra antes de confirmar?',
      answer: 'Absolutamente. Preparamos una muestra digital (mockup) sin costo para que valides el diseño antes de imprimir. Para pedidos grandes, podemos coordinar una muestra física.',
    },
  ];

  // Schema.org JSON-LD para SEO Local y de Servicio
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Regalos Empresariales y Agendas Personalizadas",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Kamaluso",
      "image": "https://kamaluso.com/logo.webp", // Ajustar URL real
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "UY"
      },
      "priceRange": "$$"
    },
    "description": "Diseño y fabricación de agendas personalizadas, libretas y regalos corporativos para empresas en Uruguay.",
    "areaServed": "Uruguay",
    "serviceType": "Corporate Gifts"
  };

  return (
    <>
      <SeoMeta
        title="Regalos Empresariales y Agendas Personalizadas Uruguay | Kamaluso"
        description="Potencia tu marca con agendas y libretas personalizadas. Regalos corporativos de alta calidad, diseño exclusivo y envíos a todo Uruguay. ¡Cotiza online!"
        url="/regalos-empresariales"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-white text-gray-900 font-sans">
        {/* Hero Section Optimizado */}
        <section className="relative bg-gray-900 text-white py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            {/* Aquí podrías poner una imagen de fondo real de una oficina o productos */}
            <Image src="/regalo-agenda-empresarial.webp" alt="Fondo oficina" fill style={{ objectFit: 'cover' }} />
          </div>
          <div className="relative max-w-5xl mx-auto text-center z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-pink-600 text-xs font-bold tracking-wider mb-4 uppercase">
              Soluciones B2B
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Regalos Empresariales que <span className="text-pink-500">Dejan Huella</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              Agendas, libretas y papelería corporativa 100% personalizada.
              Fideliza clientes y motiva a tu equipo con productos de calidad premium hechos en Uruguay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleProductSelect('')}
                className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-pink-600 hover:bg-pink-700 transition transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Solicitar Cotización
              </button>
              <Link
                href="#productos"
                className="inline-flex justify-center items-center px-8 py-4 border-2 border-white text-lg font-bold rounded-full text-white hover:bg-white hover:text-gray-900 transition"
              >
                Ver Catálogo
              </Link>
            </div>
          </div>
        </section>

        {/* Sección de Beneficios / Por qué elegirnos */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">¿Por qué elegir Papelería Personalizada Kamaluso para tu empresa?</h2>
              <p className="mt-4 text-gray-600">Nos encargamos de todo el proceso para que tú te enfoques en tu negocio.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Personalización Total', desc: 'Tu marca es la protagonista. Adaptamos colores, logos y contenidos.', icon: '🎨' },
                { title: 'Calidad Premium', desc: 'Materiales duraderos y acabados profesionales que representan bien a tu empresa.', icon: '✨' },
                { title: 'Atención Ágil', desc: 'Respuestas rápidas y cumplimiento estricto de los plazos de entrega.', icon: '🚀' },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-md transition border border-gray-100">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Productos Sugeridos */}
        <section id="productos" className="px-6 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
              Nuestras Soluciones Corporativas
            </h2>
            <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
              Desde el detalle más pequeño hasta el regalo más impactante. Encuentra el producto perfecto para tu próxima acción.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {suggestedProducts.map((product) => (
                <div
                  key={product.name}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100"
                >
                  <div className="relative w-full h-72 bg-gray-100 overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 767px) 90vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <span className="text-white font-medium">Ver detalles</span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="font-bold text-2xl mb-3 text-gray-800">{product.name}</h3>
                    <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                      {product.description}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {product.features?.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-500">
                          <span className="text-pink-500 mr-2">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleProductSelect(product.value)}
                      className="block w-full text-center py-3 rounded-lg border-2 border-pink-500 text-pink-600 font-bold hover:bg-pink-50 transition cursor-pointer"
                    >
                      Cotizar {product.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Proceso */}
        <section className="px-6 py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">
              Tu pedido listo en 4 simples pasos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center relative">
              {/* Línea conectora (solo desktop) */}
              <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-gray-700 -z-0 transform translate-y-1/2"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-pink-600 text-white rounded-full h-20 w-20 flex items-center justify-center text-3xl font-bold mb-6 shadow-lg border-4 border-gray-900">
                  1
                </div>
                <h3 className="font-bold text-xl mb-3">Contacto</h3>
                <p className="text-gray-400 text-sm px-4">
                  Completa el formulario o escríbenos por WhatsApp con tu idea y cantidad estimada.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-gray-800 text-white rounded-full h-20 w-20 flex items-center justify-center text-3xl font-bold mb-6 shadow-lg border-4 border-gray-900">
                  2
                </div>
                <h3 className="font-bold text-xl mb-3">Propuesta</h3>
                <p className="text-gray-400 text-sm px-4">
                  Recibes cotización y muestra digital de tu diseño.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-gray-800 text-white rounded-full h-20 w-20 flex items-center justify-center text-3xl font-bold mb-6 shadow-lg border-4 border-gray-900">
                  3
                </div>
                <h3 className="font-bold text-xl mb-3">Producción</h3>
                <p className="text-gray-400 text-sm px-4">
                  Aprobado el diseño, iniciamos la fabricación.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-gray-800 text-white rounded-full h-20 w-20 flex items-center justify-center text-3xl font-bold mb-6 shadow-lg border-4 border-gray-900">
                  4
                </div>
                <h3 className="font-bold text-xl mb-3">Entrega</h3>
                <p className="text-gray-400 text-sm px-4">
                  Recibes tu pedido en tu empresa, listo para regalar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Preguntas Frecuentes */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Preguntas Frecuentes
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-start">
                    <span className="text-pink-500 mr-3 text-xl">?</span>
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 ml-8 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulario de Contacto B2B */}
        <section id="contacto" className="px-6 py-24 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

            {/* Columna de Info */}
            <div className="bg-gray-900 text-white p-10 md:w-2/5 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-6">Hablemos de tu proyecto</h3>
                <p className="text-gray-300 mb-8">
                  Déjanos tus datos y un asesor especializado te contactará en menos de 24 horas con una propuesta a medida.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-pink-500 mr-3">✉️</span>
                    <span>kamalusosanjose@gmail.com</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-pink-500 mr-3">📞</span>
                    <span>098 615 074</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-pink-500 mr-3">📍</span>
                    <span>Massini 136, San José de Mayo</span>
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <p className="text-sm text-gray-500">
                  Tus datos están seguros. No compartimos tu información con terceros.
                </p>
              </div>
            </div>

            {/* Columna del Formulario */}
            <div className="p-10 md:w-3/5">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Solicitar Cotización
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
                    <input
                      type="text"
                      name="companyName"
                      id="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                  <div>
                    <label htmlFor="yourName" className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre *</label>
                    <input
                      type="text"
                      name="yourName"
                      id="yourName"
                      value={formData.yourName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="Juan Pérez"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="juan@empresa.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="098 615 074"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="productInterest" className="block text-sm font-medium text-gray-700 mb-1">Interés *</label>
                    <select
                      name="productInterest"
                      id="productInterest"
                      value={formData.productInterest}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Agendas">Agendas Personalizadas</option>
                      <option value="Libretas">Libretas Corporativas</option>
                      <option value="Planners">Planners / Anotadores</option>
                      <option value="Otro">Otro / Pack de Regalo</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                    <input
                      type="text"
                      name="quantity"
                      id="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="Ej: 50, 100, 500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje / Detalles *</label>
                  <textarea
                    name="message"
                    id="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    placeholder="Cuéntanos más sobre tu idea, fecha límite, colores, etc."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-1"
                >
                  {status === 'loading' ? 'Enviando...' : 'Enviar Solicitud de Presupuesto'}
                </button>

                {status === 'success' && (
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center">
                    {responseMessage}
                  </div>
                )}
                {status === 'error' && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
                    {responseMessage}
                  </div>
                )}
              </form>
            </div>
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
