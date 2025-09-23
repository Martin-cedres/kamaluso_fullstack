import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../context/CartContext' // Import useCart
import { useCategories } from '../context/CategoryContext' // Import useCategories

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { categories, loading } = useCategories() // Use categories from context
  const { cartCount } = useCart() // Get cart count
  const { data: session, status } = useSession()

  const closeAllMenus = () => {
    setMenuOpen(false)
    setDropdownOpen(false)
  }

  const CategoryMenu = ({ isMobile = false }) => (
    <div
      className={
        isMobile
          ? 'pl-4 mt-1 flex flex-col gap-1'
          : 'absolute top-8 left-0 bg-white shadow-lg rounded-xl py-2 w-48 z-50'
      }
    >
      {loading ? (
        <div className="px-4 py-2 text-gray-500">Cargando...</div>
      ) : (
        categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/productos/${cat.slug}`}
            className="block px-4 py-2 hover:bg-pink-50 hover:text-pink-500 transition"
            onClick={closeAllMenus}
          >
            {cat.nombre}
          </Link>
        ))
      )}
    </div>
  )

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-16">
        <Link href="/" className="flex items-center" onClick={closeAllMenus}>
          <Image
            src="/logo.webp"
            alt="Kamaluso Logo"
            width={50}
            height={50}
            className="w-auto h-12"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-900 font-medium hover:text-pink-500 transition"
          >
            Inicio
          </Link>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-gray-900 font-medium hover:text-pink-500 transition flex items-center gap-1"
            >
              Categorías ▾
            </button>
            {dropdownOpen && <CategoryMenu />}
          </div>

          <Link
            href="/regalos-empresariales"
            className="text-gray-900 font-medium hover:text-pink-500 transition"
          >
            Regalos Empresariales
          </Link>

          <Link
            href="/contacto"
            className="text-gray-900 font-medium hover:text-pink-500 transition"
          >
            Contacto
          </Link>

          <Link
            href="/blog"
            className="text-gray-900 font-medium hover:text-pink-500 transition"
          >
            Blog
          </Link>

          {status === 'authenticated' && (
            <>
              <Link
                href="/admin"
                className="text-gray-900 font-medium hover:text-pink-500 transition"
              >
                Admin
              </Link>
              <Link
                href="/admin/pedidos"
                className="text-gray-900 font-medium hover:text-pink-500 transition"
              >
                Pedidos
              </Link>
              <button
                onClick={() => signOut()}
                className="text-gray-900 font-medium hover:text-pink-500 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="hidden md:block relative text-gray-900 hover:text-pink-500 transition"
            onClick={closeAllMenus}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-900"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m16 6H4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md px-6 py-4 space-y-2">
          <Link
            href="/"
            className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition"
            onClick={closeAllMenus}
          >
            Inicio
          </Link>

          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full text-left text-gray-900 font-medium py-2 flex justify-between items-center hover:text-pink-500 transition"
            >
              Categorías ▾
            </button>
            {dropdownOpen && <CategoryMenu isMobile={true} />}
          </div>

          <Link
            href="/regalos-empresariales"
            className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition"
            onClick={closeAllMenus}
          >
            Regalos Empresariales
          </Link>

          <Link
            href="/contacto"
            className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition"
            onClick={closeAllMenus}
          >
            Contacto
          </Link>

          <Link
            href="/blog"
            className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition"
            onClick={closeAllMenus}
          >
            Blog
          </Link>

          <Link
            href="/cart"
            className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition"
            onClick={closeAllMenus}
          >
            Carrito ({cartCount})
          </Link>

          {status === 'authenticated' && (
            <>
              <Link
                href="/admin"
                className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition"
                onClick={closeAllMenus}
              >
                Admin
              </Link>
              <Link
                href="/admin/pedidos"
                className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition"
                onClick={closeAllMenus}
              >
                Pedidos
              </Link>
              <button
                onClick={() => {
                  closeAllMenus()
                  signOut()
                }}
                className="w-full text-left text-gray-900 font-medium py-2 hover:text-pink-500 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
