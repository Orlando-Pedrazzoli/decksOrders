import React from 'react';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';

const AnnouncementBar = () => {
  return (
    <div className='bg-black'>
      <div className='max-w-7xl mx-auto px-4 py-2.5'>
        <Link 
          to='/products'
          className='flex items-center justify-center gap-2 text-xs tracking-widest uppercase text-zinc-300 hover:text-white transition-colors'
        >
          <Truck className='w-4 h-4' />
          <span>Portes Grátis em encomendas +25€</span>
        </Link>
      </div>
    </div>
  );
};

export default AnnouncementBar;