import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import MultiProductInquiryTable from '../../components/inquiry/MultiProductInquiryTable';
import InquiryForm from '../../components/inquiry/InquiryForm';

// Mock data for products
const allProducts = [
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
  },
  {
    id: '4',
    title: 'Small Powder Coating Paint Booth for Wheels & Rims',
    image: '/images/products/small-booth.jpg',
    category: 'Powder Coating Booths',
    slug: 'small-powder-coating-paint-booth'
  },
  {
    id: '5',
    title: 'Closed Manual Powder Coating Spray Booth',
    image: '/images/products/closed-manual-booth.jpg',
    category: 'Powder Coating Booths',
    slug: 'closed-manual-powder-coating-spray-booth'
  },
  {
    id: '6',
    title: 'Large Size Powder Coating Booth',
    image: '/images/products/large-booth.jpg',
    category: 'Powder Coating Booths',
    slug: 'large-size-powder-coating-booth'
  },
  {
    id: '7',
    title: 'Electric Small Powder Coating Oven',
    image: '/images/products/electric-small-oven.jpg',
    category: 'Powder Coating Ovens',
    slug: 'electric-small-powder-coating-oven'
  },
  {
    id: '8',
    title: 'Gas-Fired Powder Coating Oven',
    image: '/images/products/gas-fired-oven.jpg',
    category: 'Powder Coating Ovens',
    slug: 'gas-fired-powder-coating-oven'
  },
  {
    id: '9',
    title: 'Large Powder Coating Oven',
    image: '/images/products/large-oven.jpg',
    category: 'Powder Coating Ovens',
    slug: 'large-powder-coating-oven'
  },
  {
    id: '10',
    title: 'LPG Powder Coating Oven',
    image: '/images/products/lpg-oven.jpg',
    category: 'Powder Coating Ovens',
    slug: 'lpg-powder-coating-oven'
  }
];

export default function MultiProductInquiry() {
  const [products, setProducts] = useState(allProducts.map(product => ({
    ...product,
    selected: false,
    quantity: 1
  })));
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({});
  
  const handleProductSelect = (id: string, selected: boolean) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, selected } : product
    ));
  };
  
  const handleQuantityChange = (id: string, quantity: number) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, quantity } : product
    ));
  };
  
  const handleFormSubmit = (data: any) => {
    // In a real application, this would send the data to the server
    console.log('Form submitted with data:', data);
    console.log('Selected products:', products.filter(p => p.selected));
    
    setFormData({
      ...data,
      products: products.filter(p => p.selected).map(p => ({
        id: p.id,
        title: p.title,
        quantity: p.quantity
      }))
    });
    
    setFormSubmitted(true);
  };
  
  const selectedProducts = products.filter(p => p.selected).map(p => ({
    id: p.id,
    title: p.title,
    image: p.image,
    quantity: p.quantity || 1
  }));
  
  return (
    <main>
      <Header />
      
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Multi-Product Inquiry</h1>
          
          {formSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Thank You for Your Inquiry!</h2>
              <p className="text-green-700 mb-4">We have received your inquiry and will contact you shortly.</p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition duration-300"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Products for Inquiry</h2>
                <p className="text-gray-700 mb-6">
                  Choose the products you're interested in, specify quantities, and submit your inquiry. Our team will get back to you with detailed information.
                </p>
                
                <MultiProductInquiryTable 
                  products={products}
                  onProductSelect={handleProductSelect}
                  onQuantityChange={handleQuantityChange}
                />
              </div>
              
              <InquiryForm 
                selectedProducts={selectedProducts}
                onSubmit={handleFormSubmit}
              />
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
