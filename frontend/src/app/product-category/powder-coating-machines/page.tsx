import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ProductCard from '../../components/products/ProductCard';

// Mock data for products
const products = [
  {
    id: '1',
    title: 'Static Plus 500 Powder Coating Machine',
    image: '/images/products/static-plus-500.jpg',
    category: 'Powder Coating Machines',
    slug: 'static-plus-500-powder-coating-machine'
  },
  {
    id: '2',
    title: 'OP-300 Powder Coating Machine',
    image: '/images/products/op-300.jpg',
    category: 'Powder Coating Machines',
    slug: 'op-300-powder-coating-machine'
  },
  {
    id: '3',
    title: 'Static Plus 200 Powder Coating Machine',
    image: '/images/products/static-plus-200.jpg',
    category: 'Powder Coating Machines',
    slug: 'static-plus-200-powder-coating-machine'
  }
];

export default function PowderCoatingMachines() {
  return (
    <main>
      <Header />
      
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Powder Coating Machines</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Powder Coating Machines</h1>
          
          <div className="mb-8">
            <p className="text-gray-700">
              Showing all {products.length} results
            </p>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="w-64">
                <select className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Default sorting</option>
                  <option>Sort by popularity</option>
                  <option>Sort by average rating</option>
                  <option>Sort by latest</option>
                  <option>Sort by price: low to high</option>
                  <option>Sort by price: high to low</option>
                </select>
              </div>
              
              <Link 
                href="/inquire"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
              >
                Multi-Product Inquiry
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <ProductCard 
                key={product.id}
                id={product.id}
                title={product.title}
                image={product.image}
                category={product.category}
                slug={product.slug}
              />
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
