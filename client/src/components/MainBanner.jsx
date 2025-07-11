import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import bannerVideo from '../assets/video.mp4';
import pastori_video from '../assets/pastori_video.mp4';

const MainBanner = () => {
  return (
    <div className='relative'>
      {/* Vídeo para desktop */}
      <video
        src={bannerVideo}
        autoPlay
        loop
        muted
        playsInline
        className='w-full h-[500px] hidden md:block object-cover rounded-xl'
      />

      {/* Vídeo para mobile */}
      <video
        src={pastori_video}
        autoPlay
        loop
        muted
        playsInline
        className='w-full h-[450px] md:hidden object-cover rounded'
        style={{ aspectRatio: '9/16' }}
      />

      {/* Conteúdo sobreposto */}
      <div className='text-white absolute inset-0 flex flex-col items-start justify-end pb-16 md:pb-20 px-4 md:px-8 lg:px-12'>
        <h1
          className='text-[32px] md:text-4xl lg:text-5xl font-semibold italic text-left leading-tight md:leading-none mb-6 md:mb-8'
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Surf Hard, Make History
        </h1>

        <div className='flex items-center font-medium'>
          <Link
            to={'/products'}
            className='group flex items-center gap-2 px-6 md:px-9 py-2.5 bg-primary hover:bg-primary-dull transition rounded text-white text-sm md:text-base cursor-pointer'
          >
            Ver produtos
          </Link>

          {/* Desktop arrow */}
          <Link
            to={'/products'}
            className='group hidden md:flex items-center gap-2 px-9 py-3 cursor-pointer'
          ></Link>
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
