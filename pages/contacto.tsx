import { GetStaticProps } from 'next'
import Navbar from '../components/Navbar'
import SeoMeta from '../components/SeoMeta'
import Link from 'next/link'

export default function ContactoPage() {
  const pageTitle = "Contáctanos | Kamaluso Papelería";
  const pageDescription = "Comunícate con Kamaluso Papelería en San José de Mayo, Uruguay. Estamos para ayudarte con tus pedidos y consultas de papelería personalizada.";
  const canonicalUrl = "/contacto";

  return (
    <>
      <SeoMeta
        title={pageTitle}
        description={pageDescription}
        url={canonicalUrl}
      />

      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-32 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-lg lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div className="lg:order-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contáctanos
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-600 mb-8">
              Estamos para ayudarte con tus ideas y pedidos.
            </h2>

            <div className="space-y-6 mb-10 text-gray-700">
              <div className="flex items-center gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-pink-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg">
                  Correo electrónico:{' '}
                  <a
                    href="mailto:kamalusosanjose@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    kamalusosanjose@gmail.com
                  </a>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <p className="text-lg">
                  WhatsApp:{' '}
                  <a
                    href="https://wa.me/59898615074"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    098615074
                  </a>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-lg">
                  Dirección: Calle Ramón Massini Nro 136, San José de Mayo,
                  Uruguay
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 lg:mt-0 lg:order-2">
                                        <Link
                                          href="https://www.google.com/maps/search/?api=1&query=Kamaluso+Papelería,+Calle+Ramón+Massini+136+casi+Pelosi,+San+José+de+Mayo,+Uruguay"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block relative h-64 md:h-96 rounded-lg overflow-hidden shadow-xl"
                                          aria-label="Ver Kamaluso Papelería en Google Maps"
                                        >
                                                          <iframe
                                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3294.2466986578843!2d-56.721197399999994!3d-34.344198999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a1776af4b2cb17%3A0x7ae4e8824e44a149!2sKamaluso!5e0!3m2!1ses-419!2suy!4v1760242437229!5m2!1ses-419!2suy"
                                                            width="100%"
                                                            height="100%"
                                                            style={{ border: 0 }}
                                                            allowFullScreen={false}
                                                            loading="lazy"
                                                            referrerPolicy="no-referrer-when-downgrade"
                                                            title="Ubicación de Kamaluso Papelería"
                                                          ></iframe>                                        </Link>          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 86400,
  };
};
