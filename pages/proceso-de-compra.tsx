import Head from 'next/head';
import Navbar from '../components/Navbar';
import SeoMeta from '../components/SeoMeta';
import { GetStaticProps } from 'next';

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({ number, title, description }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-pink-500 text-white font-bold text-lg">
      {number}
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);
export default function ProcesoDeCompra() {
  const pageTitle = "Proceso de Compra | Kamaluso Papelería";
  const pageDescription = "Descubre cómo comprar y personalizar tus productos en Kamaluso Papelería. Guía paso a paso para agendas, libretas y más.";
  const canonicalUrl = "/proceso-de-compra";

  const steps = [
    {
      number: 1,
      title: "Elige tu producto",
      description: "Explora nuestra papelería y selecciona el producto que más te guste.",
    },
    {
      number: 2,
      title: "Personaliza tu producto",
      description: "Para productos de tapa dura: elige el tipo de laminado (brillo o mate) y si deseas que incluya elástico. Para todos los productos: selecciona el diseño de la tapa. Puedes elegir uno de nuestra categoría 'Diseños de Tapas' o enviarnos tu propio diseño por WhatsApp.",
    },
    {
      number: 3,
      title: "Agrega al carrito",
      description: "Una vez personalizado, añade el producto a tu carrito de compras.",
    },
    {
      number: 4,
      title: "Paga de forma segura",
      description: "Finaliza tu compra utilizando el medio de pago de tu preferencia: tarjetas de crédito/débito a través de Mercado Pago, transferencia bancaria u otros métodos disponibles.",
    },
    {
      number: 5,
      title: "Recibe tu producto",
      description: "Puedes recibir tu pedido en tu casa por el método de envío seleccionado durante el proceso de compra, o retirarlo directamente en nuestro taller.",
    },
  ];

  return (
    <>
      <SeoMeta
        title={pageTitle}
        description={pageDescription}
        url={canonicalUrl}
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": pageTitle,
            "description": pageDescription,
            "step": steps.map(step => ({
              "@type": "HowToStep",
              "name": step.title,
              "text": step.description
            }))
          }) }}
          key="how-to-jsonld"
        />
      </Head>

      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-10">Proceso de Compra</h1>
          <div className="space-y-8">
            {steps.map((step) => (
              <Step key={step.number} {...step} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // No data fetching needed for this static page
  return {
    props: {},
    revalidate: 86400, // Revalidate once per day
  };
};
