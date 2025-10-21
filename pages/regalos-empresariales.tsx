import { GetStaticProps } from 'next'
import Navbar from '../components/Navbar'
import SeoMeta from '../components/SeoMeta'
import Image from 'next/image'
import Link from 'next/link'

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

  return (
    <>
      <SeoMeta
        title="Regalos Empresariales Personalizados en Uruguay | Kamaluso"
        description="Sorprende a tus clientes y empleados con regalos empresariales únicos. Agendas y libretas personalizadas con tu logo. Cotiza hoy. Envíos a todo Uruguay."
        url="/regalos-empresariales"
      />

      <Navbar />

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

        {/* Call to Action */}
        <section className="px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold mb-4">¿Listo para empezar?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Contáctanos hoy mismo para recibir una cotización sin compromiso y
            descubre cómo podemos ayudarte a destacar con regalos empresariales
            que dejan huella.
          </p>
          <Link
            href="/contacto"
            className="bg-pink-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-pink-600 transition-transform transform hover:scale-105"
          >
            Solicitar Cotización
          </Link>
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
