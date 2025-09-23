import { GetStaticProps } from 'next';
import Navbar from '../components/Navbar';
import SeoMeta from '../components/SeoMeta';

export default function EnviosPage() {
  return (
    <>
      <SeoMeta
        title="Envíos a todo Uruguay – Papelería Personalizada | Kamaluso"
        description="Conoce cómo enviamos nuestras agendas y papelería personalizada a cada rincón de Uruguay. Tiempos, costos y empresas de transporte."
        url="/envios"
      />

      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-32 px-6 pb-16">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Envíos a todo Uruguay</h1>

          <div className="prose lg:prose-xl max-w-none mx-auto text-gray-700 space-y-6">
            <p className="text-lg">
              ¡Llegamos a cada rincón del país! En Papeleria Personalizada Kamaluso, nos aseguramos de que recibas tu pedido de papelería personalizada de forma rápida y segura, sin importar en qué departamento te encuentres.
            </p>
            
            <h2 className="text-2xl font-semibold">Empresas de Transporte</h2>
            <p>
              Trabajamos con DAC y El Correo Uruguayo para garantizar la mejor cobertura y servicio. Puedes elegir la empresa que prefieras al momento de realizar tu compra.
            </p>

            <h2 className="text-2xl font-semibold">Tiempos de Entrega</h2>
            <p>
              En pedidos estandar de hasta cinco unidades, una vez que realizaste el pago de tu pedido y fue coordinado el diseño personalizado de las tapas mediante WhatsApp, el tiempo estimado de entrega a la agencia de transporte es de 72 horas hábiles. Recuerda que los artículos personalizados llevan tiempo de producción. Por cantidades mayores, consulta con nostros.
            </p>
            
            <h2 className="text-2xl font-semibold">Costos de Envío</h2>
            <p>
              El costo del envío corre por cuenta del comprador y se abona directamente a la agencia de transporte al momento de recibir o retirar el paquete. Nosotros no cobramos un extra por el despacho.
            </p>

            <h2 className="text-2xl font-semibold">¿Cómo hago el seguimiento?</h2>
            <p>
              Una vez que despachamos tu pedido, te enviaremos el número de seguimiento a través de WhatsApp o correo electrónico para que puedas ver el estado de tu envío en todo momento.
            </p>
          </div>
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