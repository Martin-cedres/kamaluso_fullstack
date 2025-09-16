import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Pedidos', href: '/admin/pedidos' },
    { name: 'Blog', href: '/admin/blog' },
    { name: 'Cupones', href: '/admin/coupons' },
    { name: 'Reseñas', href: '/admin/reviews' }, // Nuevo enlace para reseñas
    // Puedes añadir más enlaces de administración aquí
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /> 
      <div className="pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Admin Navigation */}
        <nav className="bg-white shadow-sm rounded-lg p-4 mb-8">
          <ul className="flex flex-wrap gap-4 justify-center">
            {adminNavItems.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === item.href || (item.href !== '/admin' && router.pathname.startsWith(item.href)) ? 'bg-pink-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {children}
      </div>
      <Footer />
    </div>
  );
}