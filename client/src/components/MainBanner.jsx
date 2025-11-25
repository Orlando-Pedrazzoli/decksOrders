import React from 'react';
import { Link } from 'react-router-dom';

const MainBanner = () => {
  return (
    <div className='relative'>
      {/* Imagem Hero para desktop */}
      <img
        src='/hero-new.jpg'
        alt='Elite Surfing - Surf Hard, Make History'
        className='w-full h-[600px] hidden md:block object-cover rounded-xl'
      />

      {/* Imagem Hero para mobile */}
      <img
        src='/hero-new.jpg'
        alt='Elite Surfing - Surf Hard, Make History'
        className='w-full h-[450px] md:hidden object-cover rounded'
        style={{ objectPosition: 'center' }}
      />

      {/* Overlay escuro para melhor legibilidade do texto */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-xl md:rounded-xl' />

      {/* Conteúdo sobreposto */}
      <div className='text-white absolute inset-0 flex flex-col items-start justify-end pb-16 md:pb-20 px-4 md:px-8 lg:px-12'>
        <h1
          className='text-[32px] md:text-4xl lg:text-5xl font-semibold italic text-left leading-tight md:leading-none'
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
      </div>
    </div>
  );
};

export default MainBanner;