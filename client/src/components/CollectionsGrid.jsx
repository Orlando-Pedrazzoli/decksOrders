import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const collections = [
  {
    id: 1,
    title: 'TRACTION',
    slug: '/collections/grips',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
  },
  {
    id: 2,
    title: 'LEGROPES',
    slug: '/collections/legropes',
    image: 'https://images.unsplash.com/photo-1455264745730-cb3b76250ae8?w=800&q=80',
  },
  {
    id: 3,
    title: 'BOARDCOVERS',
    slug: '/collections/surfboard-covers',
    image: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=800&q=80',
  },
  {
    id: 4,
    title: 'WAX',
    slug: '/collections/wax',
    image: 'https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=800&q=80',
  },
];

const CollectionCard = ({ title, slug, image }) => {
  return (
    <Link to={slug} className="group relative block overflow-hidden rounded-lg aspect-[4/3]">
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
        {/* Title - sempre visível */}
        <h3 className="text-white text-2xl md:text-3xl font-bold tracking-wider mb-4 text-center">
          {title}
        </h3>

        {/* VIEW Button - aparece no hover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <span className="inline-block px-6 py-2 border-2 border-white text-white text-sm font-semibold tracking-wider hover:bg-white hover:text-black transition-colors duration-300">
            VIEW
          </span>
        </motion.div>
      </div>
    </Link>
  );
};

const CollectionsGrid = () => {
  return (
    <section className="py-12 md:py-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      {/* Optional Section Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center text-3xl md:text-4xl font-bold mb-8 md:mb-12 tracking-wide"
      >
        
      </motion.h2>

      {/* Grid 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {collections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <CollectionCard
              title={collection.title}
              slug={collection.slug}
              image={collection.image}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CollectionsGrid;