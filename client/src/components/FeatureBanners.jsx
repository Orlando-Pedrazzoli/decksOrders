import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const banners = [
  {
    id: 1,
    heading: 'DECKS',
    description: 'A mais recente tecnologia EVA, colagem e padrões texturizados. Tração individualizada incrível que resistirá ao teste do tempo.',
    ctaText: 'VER COLEÇÃO',
    ctaLink: '/collections/decks', // 🆕 Link para group decks
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
    imagePosition: 'right',
  },
  {
    id: 2,
    heading: 'LEASHES',
    description: 'Leashes de qualidade premium projetados para máxima durabilidade e performance. Construídos para suportar as condições mais exigentes.',
    ctaText: 'VER COLEÇÃO',
    ctaLink: '/collections/leashes', // 🆕 Link para group leashes
    image: 'https://images.unsplash.com/photo-1455264745730-cb3b76250ae8?w=1200&q=80',
    imagePosition: 'left',
  },
];

const FeatureBanner = ({ heading, description, ctaText, ctaLink, image, imagePosition }) => {
  const isImageRight = imagePosition === 'right';

  return (
    <div className={`flex flex-col ${isImageRight ? 'lg:flex-row' : 'lg:flex-row-reverse'} min-h-[400px] lg:min-h-[500px]`}>
      {/* Content Block */}
      <motion.div
        initial={{ opacity: 0, x: isImageRight ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col justify-center items-center lg:items-start p-8 md:p-12 lg:p-16 bg-neutral-900 text-white"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider mb-4 md:mb-6 text-center lg:text-left">
          {heading}
        </h2>
        <p className="text-neutral-300 text-base md:text-lg leading-relaxed mb-6 md:mb-8 max-w-md text-center lg:text-left">
          {description}
        </p>
        <Link
          to={ctaLink}
          className="inline-block px-8 py-3 bg-white text-black font-semibold tracking-wider text-sm hover:bg-neutral-200 transition-colors duration-300"
        >
          {ctaText}
        </Link>
      </motion.div>

      {/* Image Block */}
      <motion.div
        initial={{ opacity: 0, x: isImageRight ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex-1 relative overflow-hidden"
      >
        <img
          src={image}
          alt={heading}
          className="w-full h-full object-cover min-h-[300px] lg:min-h-full"
        />
      </motion.div>
    </div>
  );
};

const FeatureBanners = () => {
  return (
    <section className="w-full">
      {banners.map((banner) => (
        <FeatureBanner
          key={banner.id}
          heading={banner.heading}
          description={banner.description}
          ctaText={banner.ctaText}
          ctaLink={banner.ctaLink}
          image={banner.image}
          imagePosition={banner.imagePosition}
        />
      ))}
    </section>
  );
};

export default FeatureBanners;