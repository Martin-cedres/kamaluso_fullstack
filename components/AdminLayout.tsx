import React from 'react';
import Navbar from './Navbar'; // Assuming Navbar is part of the admin layout
import Footer from './Footer'; // Assuming Footer is part of the admin layout

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* You might want a different Navbar/Header for admin, or pass a prop to the existing one */}
      {/* For simplicity, using the main Navbar for now */}
      <Navbar /> 
      <div className="pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </div>
      {/* You might want a different Footer for admin, or omit it */}
      {/* For simplicity, using the main Footer for now */}
      <Footer />
    </div>
  );
}