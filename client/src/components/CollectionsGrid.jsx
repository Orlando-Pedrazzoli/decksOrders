import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { groups } from '../assets/assets';

// Mobile Card - imagem + texto abaixo (como na referência FK Surf)
const MobileCard = ({ name, slug, image }) => (
  <Link to={`/collections/${slug}`} className="group block">
    <div className="overflow-hidden">
      <img
        src={image}
        alt={name}
        className="w-full h-auto aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <p className="mt-3 text-center text-sm font-medium tracking-wide text-gray-700 uppercase">
      {name}
    </p>
  </Link>
);

// Desktop Card - overlay com título e botão VIEW
const DesktopCard = ({ name, slug, image }) => (
  <Link to={`/collections/${slug}`} className="group relative block overflow-hidden aspect-[3/2]">
    {/* Background Image */}
    <div className="absolute inset-0 w-full h-full">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/50" />
    </div>
    {/* Content */}
    <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
      <h3 className="text-white text-2xl lg:text-3xl font-bold tracking-wider mb-4 text-center uppercase">
        {name}
      </h3>
      <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 inline-block px-6 py-2 border-2 border-white text-white text-sm font-semibold tracking-wider hover:bg-white hover:text-black">
        VIEW
      </span>
    </div>
  </Link>
);

const CollectionsGrid = () => {
  return (
    <section className="pt-4 pb-8 md:py-16 px-6 md:px-16 lg:px-24 xl:px-32 bg-white overflow-hidden w-full max-w-full">
      {/* Mobile: Grid 2x2 - texto abaixo */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <MobileCard
                name={group.name}
                slug={group.slug}
                image={group.image}
              />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Desktop: Grid 2x2 - overlay style */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-6">
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <DesktopCard
                name={group.name}
                slug={group.slug}
                image={group.image}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsGrid;