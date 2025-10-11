import React, { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  HomeIcon,
  ShoppingCartIcon,
  StarIcon,
  NewspaperIcon,
  TicketIcon,
  TagIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Categorías', href: '/admin/categorias', icon: TagIcon },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCartIcon },
  { name: 'Reseñas', href: '/admin/reviews', icon: StarIcon },
  { name: 'Blog', href: '/admin/blog', icon: NewspaperIcon },
  { name: 'Cupones', href: '/admin/coupons', icon: TicketIcon },
]

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const SidebarContent = () => (
    <>
      <div className="p-6 flex justify-between items-center">
        <Link
          href="/admin"
          className="text-2xl font-bold text-pink-500"
          onClick={() => setSidebarOpen(false)}
        >
          Admin Kamaluso
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-gray-600 hover:text-gray-800"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-6">
        <ul>
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-6 py-3 text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 ${
                  router.pathname === item.href ||
                  (item.href !== '/admin' &&
                    router.pathname.startsWith(item.href))
                    ? 'bg-pink-50 text-pink-600 border-r-4 border-pink-500'
                    : ''
                }`}
              >
                <item.icon className="h-6 w-6 mr-3" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans pt-16">
      {/* Static sidebar for desktop */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-white shadow-sm p-4 flex items-center sticky top-16 z-10">
          <button onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="ml-4 font-bold text-pink-500 text-lg">Admin Menu</h1>
        </header>
        <main className="flex-1 p-6 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
