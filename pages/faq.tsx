import { GetStaticProps } from 'next'
import SeoMeta from '../components/SeoMeta'

const faqs = [
  {
    question: '¿Cuánto tiempo demora la producción de un pedido?',
    answer:
      'El tiempo de producción varía según el producto y la cantidad. Generalmente, en pedidos estandar de hasta cinco unidades, una vez que realizaste el pago de tu pedido y fue coordinado el diseño personalizado de las tapas mediante WhatsApp, el tiempo estimado de entrega a la agencia de transporte es de 72 horas hábiles en estar listos para el envío. Siempre te daremos una fecha estimada al confirmar tu pedido.',
  },
  {
    question: '¿Puedo enviar mi propio logo o diseño?',
    answer:
      '¡Por supuesto! Nos encanta trabajar con tus ideas. Puedes enviarnos tu logo o diseño en formato vectorial (AI, EPS, SVG) o en alta resolución (PNG, JPG). Nuestro equipo de diseño lo revisará y te preparará una muestra digital antes de producir.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos pagos a través de Mercado Pago (tarjetas de crédito y débito), transferencias bancarias (BROU) y giros (Abitab, Red Pagos). Encontrarás todas las opciones al finalizar tu compra.',
  },
  {
    question: '¿Hacen envíos a todo Uruguay?',
    answer:
      'Sí, realizamos envíos a cada rincón de Uruguay a través de las principales agencias de transporte del país. El costo del envío corre por cuenta del comprador y se abona al recibir el paquete. Puedes ver más detalles en nuestra página de Envíos.',
  },
  {
    question: '¿Cuál es el pedido mínimo para regalos empresariales?',
    answer:
      'El pedido mínimo para acceder a precios mayoristas y personalización corporativa varía según el producto. Contáctanos a través de nuestra sección de Regalos Empresariales para que podamos darte una cotización a medida.',
  },
]

export default function FaqPage() {
  return (
    <>
      <SeoMeta
        title="Preguntas Frecuentes – Papelería Personalizada | Kamaluso"
        description="Encuentra respuestas a las dudas más comunes sobre nuestros productos de papelería personalizada, tiempos de producción, envíos a todo Uruguay y métodos de pago."
        url="/faq"
      />

      <main className="min-h-screen bg-gray-50 px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            Preguntas Frecuentes
          </h1>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  {faq.question}
                </h2>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    // Revalidate once per day
    revalidate: 86400,
  }
}
