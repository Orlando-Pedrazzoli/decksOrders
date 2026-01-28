import React from 'react';
import { Link } from 'react-router-dom';

const MainBanner = () => {
  return (
    <div className='relative -mt-[72px] overflow-hidden w-full max-w-full'>
      {/* Negative margin para ir atrás da navbar */}
      
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
      <div className='text-white absolute inset-0 flex flex-col items-start justify-end pb-16 md:pb-24 px-4 md:px-16 lg:px-24 xl:px-32'>
        <h1
          className='text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold italic text-left leading-tight md:leading-none'
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Precision Meets <br/>Performance
        </h1>
        
        {/* Assinatura Elite Surfing */}
        <div className='flex items-center gap-2 md:gap-3 mt-3 md:mt-6'>
          <span className='w-6 md:w-12 h-[1px] bg-white/60'></span>
          <p 
            className='text-xs md:text-base tracking-[0.2em] md:tracking-[0.3em] uppercase font-light text-white/90'
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