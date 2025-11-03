import { GetStaticProps } from 'next'
import SeoMeta from '../components/SeoMeta'
import Image from 'next/image'

export default function SobreNosotrosPage() {
  return (
    <>
      <SeoMeta
        title="Sobre Nosotros – Papelería Personalizada | Kamaluso"
        description="Conoce la historia de Kamaluso, nuestra pasión por la papelería personalizada y el cuidado que ponemos en cada agenda y libreta que creamos en nuestro taller en Uruguay."
        url="/sobre-nosotros"
      />

      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Nuestra Historia
            </h1>
            <p className="text-lg text-gray-600">
              Pasión por el papel, la creatividad y los detalles.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 shadow-inner space-y-6 text-gray-700 leading-relaxed">
            <p>
              ¡Hola! Somos Katherine, Martín, Lucía y Sofía, las manos y el
              corazón detrás de Kamaluso. Lo que comenzó como un pequeño hobby
              impulsado por nuestro amor por el diseño y la organización, ha
              florecido hasta convertirse en este taller creativo con base en
              San José de Mayo, Uruguay.
            </p>
            <p>
              En Kamaluso, creemos que una agenda o una libreta es más que un
              simple objeto; es un compañero de ideas, un guardián de sueños y
              una herramienta para conquistar tus metas. Por eso, cada producto
              que sale de nuestro taller es tratado con un cuidado y una
              dedicación únicos.
            </p>
            <p>
              Nos especializamos en papelería 100% personalizada porque sabemos
              que cada persona es un mundo. Disfrutamos el proceso de colaborar
              contigo para crear algo que no solo sea funcional, sino que
              también refleje tu personalidad o la identidad de tu marca.
            </p>
            <p>
              Gracias por visitarnos y por apoyar un emprendimiento hecho con
              amor. Esperamos ser parte de tu día a día.
            </p>
          </div>
        </div>
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
