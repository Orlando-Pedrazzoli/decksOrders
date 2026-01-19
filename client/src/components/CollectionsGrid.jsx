import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const collections = [
  {
    id: 1,
    title: 'TRACTION',
    slug: '/products/traction',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
  },
  {
    id: 2,
    title: 'LEGROPES',
    slug: '/products/legropes',
    image: 'https://images.unsplash.com/photo-1455264745730-cb3b76250ae8?w=800&q=80',
  },
  {
    id: 3,
    title: 'BOARDCOVERS',
    slug: '/products/boardcovers',
    image: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=800&q=80',
  },
  {
    id: 4,
    title: 'ACCESSORIES',
    slug: '/products/accessories',
    image: 'https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=800&q=80',
  },
];

// Mobile Card - imagem + texto abaixo (como na referência)
const MobileCard = ({ title, slug, image }) => (
  <Link to={slug} className="group block">
    <div className="overflow-hidden">
      <img
        src={image}
        alt={title}
        className="w-full h-auto aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <p className="mt-3 text-center text-sm font-medium tracking-wide text-gray-700 uppercase">
      {title}
    </p>
  </Link>
);

// Desktop Card - overlay com título e botão
const DesktopCard = ({ title, slug, image }) => (
  <Link to={slug} className="group relative block overflow-hidden aspect-[4/3]">
    {/* Background Image */}
    <div className="absolute inset-0 w-full h-full">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/50" />
    </div>

    {/* Content */}
    <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
      <h3 className="text-white text-2xl lg:text-3xl font-bold tracking-wider mb-4 text-center">
        {title}
      </h3>
      <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 inline-block px-6 py-2 border-2 border-white text-white text-sm font-semibold tracking-wider hover:bg-white hover:text-black">
        VIEW
      </span>
    </div>
  </Link>
);

const CollectionsGrid = () => {
  return (
    <section className="py-10 md:py-16 px-6 md:px-16 lg:px-24 xl:px-32 bg-white">
      {/* Mobile: Grid 2x2 - texto abaixo */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <MobileCard
                title={collection.title}
                slug={collection.slug}
                image={collection.image}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid 2x2 - overlay style */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <DesktopCard
                title={collection.title}
                slug={collection.slug}
                image={collection.image}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsGrid;