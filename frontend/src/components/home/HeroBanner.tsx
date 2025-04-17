import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

type HeroBannerProps = {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  subtitle,
  backgroundImage,
  ctaText,
  ctaLink
}) => {
  return (
    <div className="relative h-[500px] w-full">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-blue-900/30"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full container mx-auto px-4">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{title}</h1>
          <p className="text-xl md:text-2xl mb-8">{subtitle}</p>
          <Link 
            href={ctaLink}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-300"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
