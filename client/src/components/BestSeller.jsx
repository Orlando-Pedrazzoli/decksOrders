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
      const slideWidth = carouselRef.current.offsetWidth;
      const newSlide = Math.round(scrollLeft / slideWidth);
      setCurrentSlide(newSlide);
    }
  };

  // Scroll to specific product (2 products per view)
  const scrollToProduct = productIndex => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth;
      const slideIndex = Math.floor(productIndex / 2);
      carouselRef.current.scrollTo({
        left: slideIndex * slideWidth,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className='mt-16'>
      <p className='text-2xl md:text-3xl font-medium'>Mais Vendidos</p>

      {/* Mobile Carousel View */}
      <div className='md:hidden mt-6'>
        <div
          ref={carouselRef}
          className='flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3'
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {Array.from(
            { length: Math.ceil(shuffledProducts.length / 2) },
            (_, slideIndex) => (
              <div
                key={slideIndex}
                className='flex-none w-full flex gap-3 snap-start'
              >
                {shuffledProducts
                  .slice(slideIndex * 2, slideIndex * 2 + 2)
                  .map(product => (
                    <div key={product._id} className='flex-1'>
                      <ProductCard product={product} />
                    </div>
                  ))}
              </div>
            )
          )}
        </div>

        {/* Dots Navigation - One dot per product */}
        <div className='flex justify-center mt-4 gap-2'>
          {shuffledProducts.map((_, productIndex) => {
            const isActive = Math.floor(productIndex / 2) === currentSlide;
            const isFirstInSlide = productIndex % 2 === 0;
            const isSecondInSlide = productIndex % 2 === 1;

            return (
              <button
                key={productIndex}
                onClick={() => scrollToProduct(productIndex)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  isActive && isFirstInSlide
                    ? 'bg-primary w-6'
                    : isActive && isSecondInSlide
                    ? 'bg-primary w-6'
                    : 'bg-gray-300'
                }`}
                aria-label={`Ver produto ${productIndex + 1}`}
              />
            );
          })}
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
