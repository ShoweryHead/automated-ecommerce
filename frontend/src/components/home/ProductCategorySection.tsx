import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

type ProductCategoryProps = {
  title: string;
  description: string;
  image: string;
  link: string;
  bgColor: string;
}

const ProductCategorySection: React.FC<ProductCategoryProps> = ({
  title,
  description,
  image,
  link,
  bgColor
}) => {
  return (
    <div className={`py-16 ${bgColor}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Image */}
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <div className="relative h-[400px] w-full">
              <Image
                src={image}
                alt={title}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="w-full md:w-1/2 md:pl-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-gray-700 mb-6">{description}</p>
            <Link 
              href={link}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded transition duration-300"
            >
              Enquire Now for Best Deals!
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCategorySection;
