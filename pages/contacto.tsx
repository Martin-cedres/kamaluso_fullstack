import { GetStaticProps } from 'next';
import Navbar from '../components/Navbar';
import SeoMeta from '../components/SeoMeta';
import Link from 'next/link';

export default function ContactoPage() {
  return (
    <>
      <SeoMeta
        title="Contacto – Kamaluso"
        description="Comunicate con papeleria personalizada kamaluso tu tienda de papelería personalizada en San José de Mayo, Uruguay, envios a todo uruguay"
        url="/contacto"
      />

      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-32 px-6 pb-16">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Contáctanos</h1>
          <h2 className="text-xl text-center text-gray-600 mb-8">Estamos para ayudarte</h2>

          <div className="space-y-6 mb-10 text-gray-700">
            <div className="flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <p className="text-lg">Correo electrónico: <a href="mailto:kamalusosanjose@gmail.com" className="text-blue-600 hover:underline">kamalusosanjose@gmail.com</a></p>
            </div>

            <div className="flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <p className="text-lg">WhatsApp: <a href="https://wa.me/59898615074" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">098615074</a></p>
            </div>

            <div className="flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <p className="text-lg">Dirección: Calle Ramón Massini Nro 136, San José de Mayo, Uruguay</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
