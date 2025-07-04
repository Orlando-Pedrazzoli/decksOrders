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
      <div className='text-white absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-24 md:pb-0 px-4 md:pl-18 lg:pl-24'>
        <h1 className='text-[20px] opacity-80 md:text-4xl lg:text-5xl font-medium text-center md:text-left max-w-72 md:max-w-80 lg:max-w-105 leading-snug md:leading-tight lg:leading-15'>
          Construção precisa, design e performance garantida.
        </h1>

        <div className='flex items-center mt-5 font-medium'>
          <Link
            to={'/products'}
            className='group flex items-center gap-2 px-6 md:px-9 py-2.5 bg-primary hover:bg-primary-dull transition rounded text-white text-sm md:text-base cursor-pointer'
          >
            Ver produtos
            <img
              className='w-4 h-4 transition md:hidden group-focus:translate-x-1'
              src={assets.white_arrow_icon}
              alt='arrow'
            />
          </Link>

          {/* Desktop arrow */}
          <Link
            to={'/products'}
            className='group hidden md:flex items-center gap-2 px-9 py-3 cursor-pointer'
          >
            <img
              className='transition group-hover:translate-x-1'
              src={assets.black_arrow_icon}
              alt='arrow'
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
