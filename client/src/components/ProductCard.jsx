import React, { useState, memo } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const ProductCard = memo(({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } =
    useAppContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product || !product.image || product.image.length === 0) return null;

  const isInactive = !product.inStock;

  const nextImage = e => {
    e.stopPropagation();
    if (isInactive) return;
    setCurrentImageIndex(prev => (prev + 1) % product.image.length);
  };

  const prevImage = e => {
    e.stopPropagation();
    if (isInactive) return;
    setCurrentImageIndex(
      prev => (prev - 1 + product.image.length) % product.image.length
    );
  };

  const handleCardClick = () => {
    navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`border border-gray-500/20 rounded-md p-2 bg-white w-full transition-all duration-300 flex flex-col h-full relative ${
        isInactive
          ? 'opacity-90 cursor-default'
          : 'hover:shadow-md cursor-pointer'
      }`}
    >
      {/* Image Carousel Container */}
      <div
        className='group relative flex items-center justify-center mb-3 overflow-hidden bg-gray-50 rounded-lg'
        style={{ aspectRatio: '1 / 1', minHeight: '160px' }}
      >
        {/* 🎯 ATUALIZADO: Imagem com escurecimento suave quando inativo */}
        <img
          className={`max-w-[90%] max-h-[90%] object-contain object-center transition-all duration-300 ${
            isInactive ? 'opacity-40' : ''
          }`}
          src={product.image[currentImageIndex]}
          alt={product.name}
          loading='lazy'
        />

        {/* 🎯 ATUALIZADO: Overlay mais suave e clean */}
        {isInactive && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/5'>
            <div className='text-gray-600 px-3 py-1.5 rounded-md font-medium text-xs tracking-wide uppercase'>
              Indisponível
            </div>
          </div>
        )}

        {/* Setas de navegação - desabilitadas quando inativo */}
        {!isInactive && product.image.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className='absolute z-10 left-2 sm:left-3 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 md:opacity-30 md:group-hover:opacity-100'
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
              className='absolute z-10 right-2 sm:right-3 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 md:opacity-30 md:group-hover:opacity-100'
              aria-label='Next image'
            >
              <img
                src={assets.arrow_right}
                alt=''
                className='w-3 h-3 md:w-4 md:h-4'
              />
            </button>
          </>
        )}

        {/* Indicadores (pontos) - hidden quando inativo */}
        {!isInactive && product.image.length > 1 && (
          <div className='absolute bottom-2 z-10 left-0 right-0 flex justify-center gap-1.5'>
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
        <p
          className={`text-gray-700 font-medium text-base md:text-lg line-clamp-2 h-[3em] mt-1 ${
            isInactive ? 'opacity-60' : ''
          }`}
        >
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
            <p
              className={`text-lg md:text-xl font-medium text-gray-700 ${
                isInactive ? 'opacity-60' : ''
              }`}
            >
              {product.offerPrice.toLocaleString('pt-PT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
            </p>
            {product.offerPrice < product.price && (
              <p
                className={`text-gray-500/60 text-xs md:text-sm line-through ${
                  isInactive ? 'opacity-60' : ''
                }`}
              >
                {product.price.toLocaleString('pt-PT', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {currency}
              </p>
            )}
          </div>

          {/* 🎯 ATUALIZADO: Botão mais clean quando indisponível */}
          <div
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className='text-primary'
          >
            {isInactive ? (
              <div className='flex items-center justify-center gap-1 bg-gray-100 border border-gray-300 w-20 sm:w-24 md:w-28 h-10 sm:h-11 md:h-12 rounded-lg text-xs sm:text-sm font-medium cursor-not-allowed opacity-70'>
                <span className='text-gray-500'>Esgotado</span>
              </div>
            ) : !cartItems[product._id] ? (
              <button
                className='flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 w-20 sm:w-24 md:w-28 h-10 sm:h-11 md:h-12 rounded-lg hover:bg-primary/20 transition-colors text-sm sm:text-base md:text-lg font-medium shadow-sm active:scale-95'
                onClick={e => {
                  e.stopPropagation();
                  addToCart(product._id);
                }}
              >
                <img
                  src={assets.cart_icon}
                  alt='cart_icon'
                  className='w-4 sm:w-5 md:w-6'
                />
                Add
              </button>
            ) : (
              <div className='flex items-center justify-center gap-2 w-20 sm:w-24 md:w-28 h-10 sm:h-11 md:h-12 bg-primary/10 border border-primary/20 rounded-lg select-none shadow-sm'>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removeFromCart(product._id);
                  }}
                  className='cursor-pointer text-lg sm:text-xl md:text-2xl px-2 sm:px-3 md:px-4 h-full flex items-center justify-center hover:bg-primary/20 rounded-l-lg transition-colors active:scale-95 font-bold'
                >
                  -
                </button>
                <span className='w-6 sm:w-8 md:w-10 text-center text-sm sm:text-base md:text-lg font-semibold'>
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    addToCart(product._id);
                  }}
                  className='cursor-pointer text-lg sm:text-xl md:text-2xl px-2 sm:px-3 md:px-4 h-full flex items-center justify-center hover:bg-primary/20 rounded-r-lg transition-colors active:scale-95 font-bold'
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
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;