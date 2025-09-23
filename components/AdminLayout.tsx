import React, { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  HomeIcon,
  ShoppingCartIcon,
  StarIcon,
  NewspaperIcon,
  TicketIcon,
} from '@heroicons/react/24/outline'

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCartIcon },

  { name: 'Blog', href: '/admin/blog', icon: NewspaperIcon },
  { name: 'Cupones', href: '/admin/coupons', icon: TicketIcon },
]

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6">
          <Link href="/admin" className="text-2xl font-bold text-pink-500">
            Admin Kamaluso
          </Link>
        </div>
        <nav className="mt-6">
          <ul>
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 pt-20">{children}</main>
    </div>
  )
}

export default AdminLayout
