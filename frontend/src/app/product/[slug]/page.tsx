import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';

// Mock product data
const product = {
  id: '2',
  title: 'OP-300 Powder Coating Machine',
  slug: 'op-300-powder-coating-machine',
  category: 'Powder Coating Machines',
  categorySlug: 'powder-coating-machines',
  images: [
    {
      url: '/images/products/op-300.jpg',
      alt: 'OP-300 Powder Coating Machine for Sale'
    },
    {
      url: '/images/products/op-300-2.jpg',
      alt: 'OP-300 Powder Coating Machine Side View'
    },
    {
      url: '/images/products/op-300-3.jpg',
      alt: 'OP-300 Powder Coating Machine Control Panel'
    }
  ],
  description: `
    <p>Looking for a <strong>high-performance OP-300 Powder Coating Machine for sale</strong>? Our <strong>OP-300 Digital Powder Coating System</strong> delivers <strong>precision coating with electrostatic technology</strong>, ensuring a <strong>smooth, durable finish</strong> for metals. Ideal for <strong>industrial, automotive, and commercial</strong> applications, this machine is <strong>easy to operate</strong>, energy-efficient, and built for long-lasting performance.</p>
    
    <ul>
      <li><strong>Advanced electrostatic powder spray system</strong> for uniform coating.</li>
      <li><strong>Digital control panel</strong> for precise adjustments.</li>
      <li><strong>Compact design</strong> suitable for workshops and industrial setups.</li>
      <li><strong>Energy-efficient technology</strong> reduces operational costs.</li>
    </ul>
  `,
  features: [
    {
      title: 'Electrostatic Powder Coating Technology',
      items: [
        'Ensures strong adhesion and superior finish.',
        'Minimizes waste and overspray, improving efficiency.'
      ]
    },
    {
      title: 'Digital Control System for Precision',
      items: [
        'Adjustable voltage and powder flow for customized coatings.',
        'User-friendly interface for quick adjustments.'
      ]
    },
    {
      title: 'Durable & High-Performance Build',
      items: [
        'Built with industrial-grade materials for long-lasting use.',
        'Resistant to wear and corrosion, ensuring longevity.'
      ]
    },
    {
      title: 'Easy to Use & Maintain',
      items: [
        'Simple setup and operation, reducing downtime.',
        'Low-maintenance design for hassle-free performance.'
      ]
    }
  ],
  applications: [
    'Metal finishing for industrial products.',
    'Automotive coatings for enhanced durability.',
    'Aerospace industry applications.',
    'Furniture and household appliances manufacturing.'
  ],
  faqs: [
    {
      question: 'How does the OP-300 electrostatic powder coating system work?',
      answer: 'It uses electrostatic technology to apply powder evenly on metal surfaces, ensuring a smooth, durable finish.'
    },
    {
      question: 'Is the OP-300 suitable for small businesses?',
      answer: 'Yes! Its compact design and easy operation make it ideal for small workshops and businesses.'
    },
    {
      question: 'Do you offer international shipping for the OP-300 Powder Coating Machine?',
      answer: 'Yes, we ship to Pakistan, UAE, Saudi Arabia, Qatar, and Oman with fast delivery.'
    }
  ],
  specifications: {
    color: 'Blue, Green, Red'
  },
  relatedProducts: [
    {
      id: '1',
      title: 'Static Plus 500 Powder Coating Machine',
      image: '/images/products/static-plus-500.jpg',
      slug: 'static-plus-500-powder-coating-machine'
    },
    {
      id: '3',
      title: 'Static Plus 200 Powder Coating Machine',
      image: '/images/products/static-plus-200.jpg',
      slug: 'static-plus-200-powder-coating-machine'
    }
  ]
};

export default function ProductDetail() {
  const [activeTab, setActiveTab] = React.useState('description');
  const [activeImage, setActiveImage] = React.useState(0);
  
  return (
    <main>
      <Header />
      
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="flex items-center mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href={`/product-category/${product.categorySlug}`} className="text-blue-600 hover:text-blue-800">
              {product.category}
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">{product.title}</span>
          </div>
          
          {/* Product Overview */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Images */}
              <div>
                <div className="relative h-96 w-full mb-4 border border-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={product.images[activeImage].url}
                    alt={product.images[activeImage].alt}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                
                <div className="flex space-x-2">
                  {product.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`relative h-20 w-20 border rounded-md cursor-pointer ${activeImage === index ? 'border-blue-500' : 'border-gray-200'}`}
                      onClick={() => setActiveImage(index)}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Product Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                <div className="mb-6" dangerouslySetInnerHTML={{ __html: product.description }} />
                
                <div className="flex flex-col space-y-3 mb-6">
                  <Link 
                    href={`/inquire?product=${product.id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-3 px-6 rounded transition duration-300"
                  >
                    INQUIRE
                  </Link>
                  
                  <a 
                    href={`https://wa.me/?text=I'm interested in ${product.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-center font-medium py-3 px-6 rounded transition duration-300 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="flex border-b border-gray-200">
              <button 
                className={`px-6 py-4 font-medium ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`px-6 py-4 font-medium ${activeTab === 'additional' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('additional')}
              >
                Additional information
              </button>
              <button 
                className={`px-6 py-4 font-medium ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews (0)
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'description' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">OP-300 Powder Coating Machine for Sale – High-Performance Electrostatic System</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose the OP-300 Powder Coating Machine?</h3>
                  <ul className="list-disc pl-6 mb-6">
                    {product.features.flatMap(feature => feature.items).map((item, index) => (
                      <li key={index} className="mb-2">{item}</li>
                    ))}
                  </ul>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features of OP-300 Powder Coating Machine</h3>
                  {product.features.map((feature, index) => (
                    <div key={index} className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <ul className="list-disc pl-6">
                        {feature.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="mb-2">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Applications of OP-300 Powder Coating Equipment</h3>
                  <ul className="list-disc pl-6 mb-6">
                    {product.applications.map((application, index) => (
                      <li key={index} className="mb-2">{application}</li>
                    ))}
                  </ul>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions (FAQs)</h3>
                  <div className="space-y-4 mb-6">
                    {product.faqs.map((faq, index) => (
                      <div key={index}>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{faq.question}</h4>
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Conclusion</h3>
                  <p className="text-gray-700">
                    The <strong>OP-300 Powder Coating Machine</strong> is a <strong>high-performance solution</strong> for metal finishing, offering <strong>electrostatic precision, digital controls, and energy efficiency</strong>. Contact us today to <strong>order your OP-300 Powder Coating Machine</strong> and upgrade your coating process!
                  </p>
                </div>
              )}
              
              {activeTab === 'additional' && (
                <div>
                  <table className="w-full border-collapse">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-200">
                          <th className="py-4 px-6 text-left text-gray-700 font-medium">{key}</th>
                          <td className="py-4 px-6 text-gray-700">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div>
                  <p className="text-gray-700 mb-6">There are no reviews yet.</p>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Be the first to review "{product.title}"</h3>
                  <p className="text-gray-700 mb-4">Your email address will not be published. Required fields are marked *</p>
                  
                  <form>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">Your rating *</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button 
                            key={rating}
                            type="button"
                            className="text-gray-400 hover:text-yellow-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="review" className="block text-gray-700 font-medium mb-2">Your review *</label>
                      <textarea 
                        id="review" 
                        rows={5} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name *</label>
                        <input 
                          type="text" 
                          id="name" 
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email *</label>
                        <input 
                          type="email" 
                          id="email" 
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="save-info" 
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="save-info" className="ml-2 text-gray-700">
                          Save my name, email, and website in this browser for the next time I comment.
                        </label>
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition duration-300"
                    >
                      SUBMIT
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          {/* Related Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related products</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                  <Link href={`/product/${relatedProduct.slug}`}>
                    <div className="relative h-64 w-full">
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.title}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/product/${relatedProduct.slug}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">{relatedProduct.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-4">{product.category}</p>
                    
                    <div className="flex flex-col space-y-2">
                      <Link 
                        href={`/inquire?product=${relatedProduct.id}`}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded transition duration-300"
                      >
                        INQUIRE
                      </Link>
                      
                      <a 
                        href={`https://wa.me/?text=I'm interested in ${relatedProduct.title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-500 hover:bg-green-600 text-white text-center font-medium py-2 px-4 rounded transition duration-300 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        WhatsApp Us
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
