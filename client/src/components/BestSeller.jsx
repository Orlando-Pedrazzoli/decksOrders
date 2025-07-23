import React, { useMemo, useState, useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../context/AppContext';

const BestSeller = () => {
  const { products } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const isScrollingProgrammatically = useRef(false);

  // Memoize the shuffled products to prevent reshuffling on re-renders
  const shuffledProducts = useMemo(() => {
    return [...products]
      .filter(product => product.inStock)
      .sort(() => 0.5 - Math.random())
      .slice(0, 8);
  }, [products]);

  // Initialize carousel to start at first actual product (index 1 because of preview)
  useEffect(() => {
    if (carouselRef.current && shuffledProducts.length > 0) {
      const containerWidth = carouselRef.current.offsetWidth;
      const slideWidth = containerWidth * 0.8;

      // Start at index 1 (first real product after the preview)
      carouselRef.current.scrollTo({
        left: slideWidth,
        behavior: 'auto',
      });
    }
  }, [shuffledProducts]);

  // Handle scroll with preview cards
  const handleScroll = () => {
    if (carouselRef.current && !isScrollingProgrammatically.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const containerWidth = carouselRef.current.offsetWidth;
      const slideWidth = containerWidth * 0.8;

      // Adjust for preview card at beginning
      const slideIndex = Math.round(scrollLeft / slideWidth) - 1;
      const clampedSlide = Math.max(
        0,
        Math.min(slideIndex, shuffledProducts.length - 1)
      );

      setCurrentSlide(clampedSlide);
    }
  };

  // Navigate to next slide with loop
  const nextSlide = () => {
    const nextIndex =
      currentSlide < shuffledProducts.length - 1 ? currentSlide + 1 : 0;
    scrollToSlide(nextIndex);
  };

  // Navigate to previous slide with loop
  const prevSlide = () => {
    const prevIndex =
      currentSlide > 0 ? currentSlide - 1 : shuffledProducts.length - 1;
    scrollToSlide(prevIndex);
  };

  // Scroll to specific slide (adjusted for preview cards)
  const scrollToSlide = slideIndex => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.offsetWidth;
      const slideWidth = containerWidth * 0.8;

      // Add 1 to slideIndex to account for the preview card at the beginning
      const scrollPosition = (slideIndex + 1) * slideWidth;

      isScrollingProgrammatically.current = true;
      setCurrentSlide(slideIndex);

      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });

      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 600);
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
              paddingLeft: '10%',
              paddingRight: '10%',
              scrollSnapType: 'x mandatory',
            }}
          >
            {/* Add last product at the beginning for peek effect */}
            {shuffledProducts.length > 0 && (
              <div
                className='flex-none snap-center'
                style={{
                  width: '80%',
                  minWidth: '80%',
                  scrollSnapAlign: 'center',
                  opacity: 0.7,
                }}
              >
                <div className='px-2'>
                  <ProductCard
                    product={shuffledProducts[shuffledProducts.length - 1]}
                  />
                </div>
              </div>
            )}

            {shuffledProducts.map((product, index) => (
              <div
                key={product._id}
                className='flex-none snap-center'
                style={{
                  width: '80%',
                  minWidth: '80%',
                  scrollSnapAlign: 'center',
                }}
              >
                <div className='px-2'>
                  <ProductCard product={product} />
                </div>
              </div>
            ))}

            {/* Add first product at the end for peek effect */}
            {shuffledProducts.length > 0 && (
              <div
                className='flex-none snap-center'
                style={{
                  width: '80%',
                  minWidth: '80%',
                  scrollSnapAlign: 'center',
                  opacity: 0.7,
                }}
              >
                <div className='px-2'>
                  <ProductCard product={shuffledProducts[0]} />
                </div>
              </div>
            )}
          </div>

          {/* Gradient fade on right to indicate more content */}
          <div
            className='absolute top-0 right-0 h-full w-8 pointer-events-none'
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.8))',
            }}
          />

          {/* Scroll indicator dots */}
          <div className='flex justify-center mt-4 gap-1'>
            {shuffledProducts.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-gray-800 w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Subtle scroll hint text */}
          <p className='text-center text-xs text-gray-500 mt-2 opacity-75'>
            Deslize para ver mais produtos
          </p>
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
