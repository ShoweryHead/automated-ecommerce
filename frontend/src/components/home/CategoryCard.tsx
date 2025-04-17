import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

type CategoryCardProps = {
  title: string;
  description: string;
  image: string;
  link: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  image,
  link
}) => {
  return (
    <div className="bg-blue-100 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative h-64 w-full">
        <Image
          src={image}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 mb-4">{description}</p>
        <Link 
          href={link}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
        >
          Find More
        </Link>
      </div>
    </div>
  );
};

export default CategoryCard;
