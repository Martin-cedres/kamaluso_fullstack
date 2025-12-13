import Link from 'next/link';

interface Categoria {
  _id: string;
  nombre: string;
  slug: string;
  children: Categoria[];
}

interface MegaMenuProps {
  categories: Categoria[];
  closeAllMenus: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

const MegaMenu = ({ categories, closeAllMenus, handleMouseEnter, handleMouseLeave }: MegaMenuProps) => {
  return (
    <div
      className="absolute left-0 top-16 w-full pt-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 max-w-2xl mx-auto">
        <div className="flex divide-x divide-gray-100">
          {/* Agendas */}
          <Link
            href="/productos/agendas-tapa-dura"
            onClick={closeAllMenus}
            className="flex-1 px-8 py-6 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="font-semibold text-lg text-gray-900 group-hover:text-pink-600 transition">
                Agendas
              </span>
              <span className="text-sm text-gray-500 group-hover:text-gray-700">
                Organiza tu año
              </span>
            </div>
          </Link>

          {/* Libretas */}
          <Link
            href="/productos/libretas-y-cuadernos"
            onClick={closeAllMenus}
            className="flex-1 px-8 py-6 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition">
                Libretas
              </span>
              <span className="text-sm text-gray-500 group-hover:text-gray-700">
                Para tus ideas
              </span>
            </div>
          </Link>

          {/* Ver Todo */}
          <Link
            href="/productos"
            onClick={closeAllMenus}
            className="flex-1 px-8 py-6 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition">
                Ver Todo
              </span>
              <span className="text-sm text-gray-500 group-hover:text-gray-700">
                Catálogo completo
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;

