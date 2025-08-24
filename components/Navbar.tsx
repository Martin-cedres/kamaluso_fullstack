// app/components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/">
                          <Image src="/logo.webp" alt="Kamaluso Logo" width={120} height={40} className="w-auto h-full" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-900 font-medium hover:text-pink-500 transition">
            Inicio
          </Link>

          {/* Dropdown Productos */}
          <div className="relative">
            <button
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
              className="text-gray-900 font-medium hover:text-pink-500 transition flex items-center gap-1"
            >
              Productos ▾
            </button>
            {dropdownOpen && (
              <div
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
                className="absolute top-8 left-0 bg-white shadow-lg rounded-xl py-2 w-48 transition-all duration-300"
              >
                <Link
                  href="/productos?sublimables=true"
                  className="block px-4 py-2 hover:bg-pink-50 hover:text-pink-500 transition"
                >
                  Sublimables
                </Link>
                <Link
                  href="/productos?personalizados=true"
                  className="block px-4 py-2 hover:bg-pink-50 hover:text-pink-500 transition"
                >
                  Personalizados
                </Link>
              </div>
            )}
          </div>

          <Link href="/contacto" className="text-gray-900 font-medium hover:text-pink-500 transition">
            Contacto
          </Link>
        </div>

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
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md px-6 py-4">
          <Link
            href="/"
            className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition"
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </Link>

          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full text-left text-gray-900 font-medium py-2 flex justify-between items-center hover:text-pink-500 transition"
            >
              Productos ▾
            </button>
            {dropdownOpen && (
              <div className="pl-4 mt-1 flex flex-col gap-1">
                <Link
                  href="/productos?sublimables=true"
                  className="py-2 text-gray-900 hover:text-pink-500 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Sublimables
                </Link>
                <Link
                  href="/productos?personalizados=true"
                  className="py-2 text-gray-900 hover:text-pink-500 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Personalizados
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/contacto"
            className="block text-gray-900 font-medium py-2 hover:text-pink-500 transition"
            onClick={() => setMenuOpen(false)}
          >
            Contacto
          </Link>
        </div>
      )}
    </nav>
  );
}

