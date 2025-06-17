import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } =
    useAppContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product || !product.image || product.image.length === 0) return null;

  const nextImage = e => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % product.image.length);
  };

  const prevImage = e => {
    e.stopPropagation();
    setCurrentImageIndex(
      prev => (prev - 1 + product.image.length) % product.image.length
    );
  };

  return (
    <div
      onClick={() => {
        navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
        window.scrollTo(0, 0);
      }}
      className='border border-gray-500/20 rounded-md p-3 bg-white w-full hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full'
    >
      {/* Image Carousel Container */}
      <div
        className='group relative flex items-center justify-center mb-3 overflow-hidden bg-gray-50 rounded-lg'
        style={{ aspectRatio: '1/1', minHeight: '160px' }}
      >
        <img
          className='w-full h-full object-contain p-4 transition-transform duration-300'
          src={product.image[currentImageIndex]}
          alt={product.name}
          loading='lazy'
        />

        {/* Navigation Arrows */}
        {product.image.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className='absolute left-2 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 md:opacity-30 md:group-hover:opacity-100'
              aria-label='Previous image'
            >
              <img
                src={assets.arrow_left}
                alt=''
                className='w-3 h-3 md:w-4 md:h-4'
              />
            </button>
            <button
              onClick={nextImage}
              className='absolute right-2 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 md:opacity-30 md:group-hover:opacity-100'
              aria-label='Next image'
            >
              <img
                src={assets.arrow_right}
                alt=''
                className='w-3 h-3 md:w-4 md:h-4 '
              />
            </button>
          </>
        )}

        {/* Image Indicators (Dots) */}
        {product.image.length > 1 && (
          <div className='absolute bottom-2 left-0 right-0 flex justify-center gap-1.5'>
            {product.image.map((_, index) => (
              <button
                key={index}
                onClick={e => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${
                  currentImageIndex === index
                    ? 'bg-primary w-3 md:w-4'
                    : 'bg-gray-300/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className='flex flex-col flex-grow text-gray-500/60 text-sm'>
        <p className='text-gray-700 font-medium text-base md:text-lg line-clamp-2 h-[3em] mt-1'>
          {product.name}
        </p>

        {/* Rating */}
        <div className='flex items-center gap-0.5 mt-2'>
          {Array(5)
            .fill('')
            .map((_, i) => (
              <img
                key={i}
                className='w-3 md:w-3.5'
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt=''
              />
            ))}
          <p className='text-xs md:text-sm'>(4)</p>
        </div>

        {/* Price and Add to Cart */}
        <div className='flex items-end justify-between mt-3 flex-grow'>
          <div>
            <p className='text-lg md:text-xl font-medium text-gray-700'>
              {product.offerPrice.toLocaleString('pt-PT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
            </p>
            {product.offerPrice < product.price && (
              <p className='text-gray-500/60 text-xs md:text-sm line-through'>
                {product.price.toLocaleString('pt-PT', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {currency}
              </p>
            )}
          </div>

          <div
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className='text-primary'
          >
            {!cartItems[product._id] ? (
              <button
                className='flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 w-16 md:w-20 h-8 md:h-9 rounded hover:bg-primary/20 transition-colors text-sm md:text-base'
                onClick={e => {
                  e.stopPropagation();
                  addToCart(product._id);
                }}
              >
                <img
                  src={assets.cart_icon}
                  alt='cart_icon'
                  className='w-3 md:w-4'
                />
                Add
              </button>
            ) : (
              <div className='flex items-center justify-center gap-2 w-16 md:w-20 h-8 md:h-9 bg-primary/10 border border-primary/20 rounded select-none'>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removeFromCart(product._id);
                  }}
                  className='cursor-pointer text-md px-1 md:px-2 h-full flex items-center hover:bg-primary/20 rounded-l'
                >
                  -
                </button>
                <span className='w-4 md:w-5 text-center text-sm md:text-base'>
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    addToCart(product._id);
                  }}
                  className='cursor-pointer text-md px-1 md:px-2 h-full flex items-center hover:bg-primary/20 rounded-r'
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
