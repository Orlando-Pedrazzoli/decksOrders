import React from 'react';
import { Link } from 'react-router-dom';

const MainBanner = () => {
  return (
    <div className='relative -mt-[72px]'> {/* Negative margin para ir atrás da navbar */}
      {/* Imagem Hero para desktop - Full bleed */}
      <img
        src='/hero-new.jpg'
        alt='Elite Surfing - Surf Hard, Make History'
        className='w-full h-[85vh] min-h-[600px] hidden md:block object-cover'
      />

      {/* Imagem Hero para mobile - Full bleed */}
      <img
        src='/hero-new.jpg'
        alt='Elite Surfing - Surf Hard, Make History'
        className='w-full h-[75vh] min-h-[500px] md:hidden object-cover'
        style={{ objectPosition: 'center' }}
      />

      {/* Overlay escuro para melhor legibilidade do texto */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30' />

      {/* Conteúdo sobreposto */}
      <div className='text-white absolute inset-0 flex flex-col items-start justify-end pb-20 md:pb-24 px-6 md:px-16 lg:px-24 xl:px-32'>
        <h1
          className='text-[32px] md:text-4xl lg:text-5xl xl:text-6xl font-semibold italic text-left leading-tight md:leading-none'
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Precision Meets <br/>Performance
        </h1>

        {/* Assinatura Elite Surfing */}
        <div className='flex items-center gap-3 mt-4 md:mt-6'>
          <span className='w-8 md:w-12 h-[1px] bg-white/60'></span>
          <p 
            className='text-sm md:text-base tracking-[0.3em] uppercase font-light text-white/90'
            style={{
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            Elite Surfing
          </p>
        </div>

        {/* CTA Button opcional */}
        <Link 
          to='/products'
          className='mt-6 md:mt-8 px-8 py-3 bg-primary hover:bg-primary-dull text-white text-sm md:text-base font-medium tracking-wider uppercase transition-all duration-300 hover:translate-y-[-2px]'
        >
          Ver Produtos
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60'>
        <span className='text-white text-xs tracking-widest uppercase'>Scroll</span>
        <div className='w-px h-8 bg-gradient-to-b from-white to-transparent animate-pulse' />
      </div>
    </div>
  );
};

export default MainBanner;