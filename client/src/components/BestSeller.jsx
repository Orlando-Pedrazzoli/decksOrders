import React, { useMemo, useState, useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../context/AppContext';

const BestSeller = () => {
  const { products } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  // Memoize the shuffled products to prevent reshuffling on re-renders
  const shuffledProducts = useMemo(() => {
    return [...products]
      .filter(product => product.inStock)
      .sort(() => 0.5 - Math.random())
      .slice(0, 8);
  }, [products]);

  // Handle scroll to update current slide indicator
  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const containerWidth = carouselRef.current.offsetWidth;
      const slideWidth = containerWidth * 0.8;
      const newSlide = Math.round(scrollLeft / slideWidth);
      setCurrentSlide(
        Math.max(0, Math.min(newSlide, shuffledProducts.length - 1))
      );
    }
  };

  // Navigate to next slide
  const nextSlide = () => {
    if (currentSlide < shuffledProducts.length - 1) {
      scrollToSlide(currentSlide + 1);
    }
  };

  // Navigate to previous slide
  const prevSlide = () => {
    if (currentSlide > 0) {
      scrollToSlide(currentSlide - 1);
    }
  };

  // Scroll to specific slide
  const scrollToSlide = slideIndex => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.offsetWidth;
      const slideWidth = containerWidth * 0.8;
      const scrollPosition = slideIndex * slideWidth;

      // Temporarily disable scroll listener to prevent conflicts
      const carousel = carouselRef.current;
      carousel.removeEventListener('scroll', handleScroll);

      carousel.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });

      // Update state immediately
      setCurrentSlide(slideIndex);

      // Re-enable scroll listener after animation completes
      setTimeout(() => {
        if (carousel) {
          carousel.addEventListener('scroll', handleScroll, { passive: true });
        }
      }, 300);
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      // Add scroll listener with passive option for better performance
      const scrollHandler = handleScroll;
      carousel.addEventListener('scroll', scrollHandler, { passive: true });

      return () => {
        if (carousel) {
          carousel.removeEventListener('scroll', scrollHandler);
        }
      };
    }
  }, [shuffledProducts.length]);

  return (
    <div className='mt-16'>
      <p className='text-2xl md:text-3xl font-medium'>Mais Vendidos</p>

      {/* Mobile Carousel View */}
      <div className='md:hidden mt-6'>
        <div className='relative'>
          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className='flex overflow-x-auto snap-x snap-mandatory scrollbar-hide'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingLeft: '10%', // Espaço para mostrar pedacinho da esquerda
              paddingRight: '10%', // Espaço para mostrar pedacinho da direita
            }}
          >
            {shuffledProducts.map((product, index) => (
              <div
                key={product._id}
                className='flex-none snap-center'
                style={{
                  width: '80%',
                  minWidth: '80%', // Garante que não vai encolher
                }}
              >
                <div className='px-2'>
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className='flex justify-center mt-6 gap-4'>
            {/* Previous Arrow */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                currentSlide === 0
                  ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                  : 'border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
              aria-label='Produto anterior'
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M15 18l-6-6 6-6' />
              </svg>
            </button>

            {/* Next Arrow */}
            <button
              onClick={nextSlide}
              disabled={currentSlide === shuffledProducts.length - 1}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                currentSlide === shuffledProducts.length - 1
                  ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                  : 'border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
              aria-label='Próximo produto'
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M9 18l6-6-6-6' />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Grid View */}
      <div className='hidden md:grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-4 mt-6'>
        {shuffledProducts.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
