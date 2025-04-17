import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description
}) => {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="mb-4">
        <Image 
          src={icon} 
          alt={title} 
          width={64} 
          height={64}
        />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

export default FeatureCard;
