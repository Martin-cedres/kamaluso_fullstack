import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 py-12 mt-16 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Columna de Navegación */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Navegación</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/regalos-empresariales"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Regalos Empresariales
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna de Soporte */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Soporte</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/sobre-nosotros"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link
                  href="/envios"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Envíos
                </Link>
              </li>
              <li>
                <Link
                  href="/proceso-de-compra"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Proceso de Compra
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Papelería Personalizada Kamaluso.
            Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
