import { GetStaticProps } from 'next'
import SeoMeta from '../components/SeoMeta'

import { faqsData as faqs } from '../lib/data/faqs'

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
