import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white py-6 mt-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-700">
        <p className="text-sm text-center md:text-left">
          &copy; 2025 Papelería Personalizada Kamaluso. Todos los derechos reservados.
        </p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <Link href="/blog" className="hover:text-pink-500 transition-colors text-sm">
            Blog
          </Link>
          <Link href="/contacto" className="hover:text-pink-500 transition-colors text-sm">
            Contacto
          </Link>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors text-sm">
            Instagram
          </a>
          <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors text-sm">
            Facebook
          </a>
          <a href="https://wa.me/549XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors text-sm">
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}