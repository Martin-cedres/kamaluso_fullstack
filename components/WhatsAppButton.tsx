import { useRouter } from 'next/router'

interface WhatsAppButtonProps {
  customMessage?: string
}

const WhatsAppButton = ({ customMessage }: WhatsAppButtonProps) => {
  const router = useRouter()
  // Check if we are on a product detail page
  const isProductDetailPage = router.pathname.includes('/productos/detail/')

  const phoneNumber = '59898615074'
  const defaultText =
    customMessage || '¡Hola! Vi sus productos en Papelería Personalizada y quiero más info.'
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultText)}`

  // Determine visibility and position
  // 1. Mobile: Show ONLY on Product Detail (hidden otherwise)
  // 2. Desktop: Always show (md:block)
  // 3. Position: Higher on Product Detail (mobile only)

  const visibilityClass = isProductDetailPage ? 'block' : 'hidden md:block'
  const positionClass = isProductDetailPage ? 'bottom-24 md:bottom-5' : 'bottom-5'

  return (
    <div className={`fixed right-5 z-[70] group ${visibilityClass} ${positionClass}`}>
      {/* Tooltip al hover */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-xl">
          ¡Chatea con nosotros!
          <div className="absolute top-full right-4 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Botón de WhatsApp */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        {/* Animación de pulso sutil eliminada para no competir con el bot */}
        {/* <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping"></span> */}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="relative z-10"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>
    </div>
  )
}

export default WhatsAppButton
