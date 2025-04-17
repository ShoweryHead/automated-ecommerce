import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroBanner from '../components/home/HeroBanner';
import CategoryCard from '../components/home/CategoryCard';
import FeatureCard from '../components/home/FeatureCard';
import ProductCategorySection from '../components/home/ProductCategorySection';
import FeaturedProductsSection from '../components/home/FeaturedProductsSection';

// Mock data for homepage
const featuredProducts = [
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
  }
];

const categories = [
  {
    title: 'Powder Coating Machines',
    description: 'Explore Our Efficient and Durable Powder Coating Machines.',
    image: '/images/categories/powder-coating-machines.jpg',
    link: '/product-category/powder-coating-machines'
  },
  {
    title: 'Powder Coating Booth',
    description: 'Discover Reliable and Efficient Powder Coating Booths.',
    image: '/images/categories/powder-coating-booths.jpg',
    link: '/product-category/powder-coating-booths'
  },
  {
    title: 'Powder Coating Ovens',
    description: 'Explore High-Performance Powder Coating Ovens.',
    image: '/images/categories/powder-coating-ovens.jpg',
    link: '/product-category/powder-coating-ovens'
  }
];

const features = [
  {
    icon: '/images/icons/worldwide-shipping.png',
    title: 'Worldwide Shipping',
    description: 'Fast & Reliable shipping for Powder Coating Machines across Pakistan and the Gulf region.'
  },
  {
    icon: '/images/icons/best-quality.png',
    title: 'Best Quality',
    description: 'Superior-Quality Powder Coating Machines Engineered for exceptional Performance.'
  },
  {
    icon: '/images/icons/competitive-pricing.png',
    title: 'Competitive Pricing',
    description: 'Affordable, High-Quality Powder Coating Machines for Professionals.'
  },
  {
    icon: '/images/icons/secure-payments.png',
    title: 'Secure Payments',
    description: 'Trusted and seamless transactions for Powder Coating Machines in Pakistan & Gulf.'
  }
];

export default function Home() {
  return (
    <main>
      <Header />
      
      <HeroBanner 
        title="Premium Powder Coating Machines!"
        subtitle="Reliable Performance for Every Project!"
        backgroundImage="/images/hero-banner.jpg"
        ctaText="ENQUIRE NOW"
        ctaLink="/inquire"
      />
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Explore by Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <CategoryCard 
                key={index}
                title={category.title}
                description={category.description}
                image={category.image}
                link={category.link}
              />
            ))}
          </div>
        </div>
      </div>
      
      <FeaturedProductsSection 
        title="Featured Products"
        products={featuredProducts}
      />
      
      <ProductCategorySection 
        title="Powder Coating Machines"
        description="Explore our high-quality Powder Coating Machines, designed for efficient and durable coating applications. Perfect for industrial and commercial use, ensuring smooth, long-lasting finishes with precision and ease."
        image="/images/categories/powder-coating-machines-large.jpg"
        link="/product-category/powder-coating-machines"
        bgColor="bg-blue-100"
      />
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
