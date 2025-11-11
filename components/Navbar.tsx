import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useCategories } from '../context/CategoryContext';
import MegaMenu from './MegaMenu';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { categories, loading } = useCategories();
  const { cartCount } = useCart();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const menuCloseTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const closeAllMenus = () => {
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  const handleDropdownToggle = (slug: string) => {
    setOpenDropdown(openDropdown === slug ? null : slug);
  };

  const handleMenuEnter = () => {
    if (menuCloseTimer.current) {
      clearTimeout(menuCloseTimer.current);
    }
    setOpenDropdown('productos');
  };

  const handleMenuLeave = () => {
    menuCloseTimer.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200); // 200ms delay before closing
  };

  const renderCategoryLinks = (isMobile: boolean = false) => {
    if (loading) {
      return <div className={isMobile ? "block py-2" : "py-1"}>Cargando categorías...</div>;
    }

    // This function is now only for the mobile menu's accordion
    return categories.map((cat) => (
      <div key={cat._id}>
        {cat.children && cat.children.length > 0 ? (
          <>
            <button
              onClick={() => handleDropdownToggle(cat.slug)}
              className="relative py-1 text-gray-900 font-medium transition group hover:text-pink-500 flex items-center gap-1 w-full text-left justify-between"
            >
              <span>{cat.nombre}</span>
              <span className="transform transition-transform duration-200" style={{ transform: openDropdown === cat.slug ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
            </button>
            {openDropdown === cat.slug && (
              <div className="pl-4 mt-1 flex flex-col gap-1">
                <Link href={`/productos/${cat.slug}`} onClick={closeAllMenus} className="block px-4 py-2 hover:bg-pink-50 hover:text-pink-500 transition font-semibold">
                  Ver Todo {cat.nombre}
                </Link>
                {cat.children.map((child) => (
                  <Link key={child._id} href={`/productos/${cat.slug}/${child.slug}`} onClick={closeAllMenus} className="block px-4 py-2 hover:bg-pink-50 hover:text-pink-500 transition">
                    {child.nombre}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <Link href={`/productos/${cat.slug}`} onClick={closeAllMenus} className="relative py-1 text-gray-900 font-medium transition group hover:text-pink-500 block">
            {cat.nombre}
          </Link>
        )}
      </div>
    ));
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-16">
        <Link href="/" className="flex items-center" onClick={closeAllMenus}>
          <Image src="/logo.webp" alt="Kamaluso Logo" width={50} height={50} className="w-auto h-12" unoptimized />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="relative py-1 text-gray-900 font-medium transition group hover:text-pink-500">
            Inicio
            <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          
          {/* Mega Menu Container */}
          <div 
            className="relative"
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
          >
            <button className="relative py-1 text-gray-900 font-medium transition flex items-center gap-1">
              <span>Productos</span>
              <span className="transform transition-transform duration-200" style={{ transform: openDropdown === 'productos' ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
            </button>
            
            {openDropdown === 'productos' && !loading && (
              <MegaMenu 
                categories={categories} 
                closeAllMenus={closeAllMenus}
                handleMouseEnter={handleMenuEnter}
                handleMouseLeave={handleMenuLeave}
              />
            )}
          </div>

          <Link href="/regalos-empresariales" className="relative py-1 text-gray-900 font-medium transition group hover:text-pink-500">
            Regalos Empresariales
            <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/contacto" className="relative py-1 text-gray-900 font-medium transition group hover:text-pink-500">
            Contacto
            <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/blog" className="relative py-1 text-gray-900 font-medium transition group hover:text-pink-500">
            Blog
            <span className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-0 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          {isClient && status === 'authenticated' && (
            <>
              <Link href="/admin" className="relative py-1 text-gray-900 font-medium transition group hover:text-pink-500">
                Admin
              </Link>
              <Link href="/admin/pedidos" className="relative py-1 text-gray-900 font-medium transition group hover:text-pink-500">
                Pedidos
              </Link>
              <button onClick={() => signOut()} className="relative py-1 text-gray-900 font-medium transition group hover:text-pink-500">
                Logout
              </button>
            </>
          )}
        </div>

        {/* Right side icons */}
        {isClient && (
          <div className="flex items-center gap-4">
            <Link href="/cart" className="hidden md:block relative text-gray-900 hover:text-pink-500 transition" onClick={closeAllMenus}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}
            </Link>
            <button className="md:hidden text-gray-900" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m16 6H4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isClient && (
        <div className={`md:hidden bg-white shadow-md px-6 py-4 space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <Link href="/" className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition" onClick={closeAllMenus}>Inicio</Link>
          {renderCategoryLinks(true)}
          <Link href="/regalos-empresariales" className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition" onClick={closeAllMenus}>Regalos Empresariales</Link>
          <Link href="/contacto" className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition" onClick={closeAllMenus}>Contacto</Link>
          <Link href="/blog" className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition" onClick={closeAllMenus}>Blog</Link>
          <Link href="/cart" className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition" onClick={closeAllMenus}>Carrito ({cartCount})</Link>
          {status === 'authenticated' && (
            <>
              <Link href="/admin" className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition" onClick={closeAllMenus}>Admin</Link>
              <Link href="/admin/pedidos" className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition" onClick={closeAllMenus}>Pedidos</Link>
              <button onClick={() => { closeAllMenus(); signOut(); }} className="w-full text-left text-gray-900 font-medium py-2 hover:text-pink-500 transition">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
