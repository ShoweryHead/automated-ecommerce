import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="h-16 w-48 relative">
                <Image 
                  src="/logo-placeholder.png" 
                  alt="Coating Machines Logo" 
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </Link>
          </div>
          
          {/* Main Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link href="/product-category/powder-coating-machines" className="px-3 py-2 text-blue-600 hover:text-blue-800 font-medium">
              Powder Coating Machines
            </Link>
            <Link href="/product-category/powder-coating-booths" className="px-3 py-2 text-blue-600 hover:text-blue-800 font-medium">
              Powder Coating Booths
            </Link>
            <Link href="/product-category/powder-coating-ovens" className="px-3 py-2 text-blue-600 hover:text-blue-800 font-medium">
              Powder Coating Ovens
            </Link>
            <Link href="/product-category/accessories-parts" className="px-3 py-2 text-blue-600 hover:text-blue-800 font-medium">
              Accessories & Parts
            </Link>
            <Link href="/about" className="px-3 py-2 text-blue-600 hover:text-blue-800 font-medium">
              About
            </Link>
            <Link href="/contact" className="px-3 py-2 text-blue-600 hover:text-blue-800 font-medium">
              Contact Us
            </Link>
          </nav>
          
          {/* Account Icon */}
          <div className="flex items-center">
            <Link href="/account" aria-label="Account icon link" className="p-2 text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            
            {/* Mobile menu button */}
            <button className="md:hidden ml-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
