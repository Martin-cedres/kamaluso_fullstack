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
      <div className="bg-white shadow-lg rounded-xl p-6 w-max z-50">
        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
          {categories.map((cat) => (
            <div key={cat._id} className="flex flex-col gap-2">
              <Link
                href={`/productos/${cat.slug}`}
                onClick={closeAllMenus}
                className="text-lg font-semibold text-gray-800 hover:text-pink-500 transition border-b-2 border-transparent hover:border-pink-500 pb-1"
              >
                {cat.nombre}
              </Link>
              <div className="flex flex-col gap-1">
                {cat.children && cat.children.map((child) => (
                  <Link
                    key={child._id}
                    href={`/productos/${cat.slug}/${child.slug}`}
                    onClick={closeAllMenus}
                    className="text-gray-600 hover:text-pink-500 transition"
                  >
                    {child.nombre}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
