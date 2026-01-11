import React, { useState, memo, useMemo } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const ProductCard = memo(({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } =
    useAppContext();
  
  // 🎯 Estado para variante selecionada
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product || !product.image || product.image.length === 0) return null;

  // 🎯 CALCULAR STOCK E DISPONIBILIDADE
  const hasVariants = product.variants && product.variants.length > 0;
  
  const totalStock = useMemo(() => {
    if (hasVariants) {
      return product.variants.reduce((total, v) => total + (v.stock || 0), 0);
    }
    return product.stock || 0;
  }, [product, hasVariants]);
  
  const isInactive = totalStock === 0;
  
  // 🎯 IMAGENS A EXIBIR (baseado na variante selecionada)
  const displayImages = useMemo(() => {
    if (selectedVariant) {
      const variant = product.variants.find(v => v._id === selectedVariant);
      if (variant && variant.images && variant.images.length > 0) {
        return variant.images;
      }
    }
    return product.image;
  }, [product, selectedVariant]);

  // 🎯 STOCK DA VARIANTE SELECIONADA
  const currentStock = useMemo(() => {
    if (selectedVariant && hasVariants) {
      const variant = product.variants.find(v => v._id === selectedVariant);
      return variant?.stock || 0;
    }
    return hasVariants ? totalStock : (product.stock || 0);
  }, [product, selectedVariant, hasVariants, totalStock]);

  // 🎯 PREÇO DA VARIANTE (se tiver preço específico)
  const currentPrice = useMemo(() => {
    if (selectedVariant && hasVariants) {
      const variant = product.variants.find(v => v._id === selectedVariant);
      if (variant?.offerPrice) {
        return {
          price: variant.price || product.price,
          offerPrice: variant.offerPrice,
        };
      }
    }
    return {
      price: product.price,
      offerPrice: product.offerPrice,
    };
  }, [product, selectedVariant, hasVariants]);

  // 🎯 KEY DO CARRINHO (productId ou productId_variantId)
  const cartKey = selectedVariant ? `${product._id}_${selectedVariant}` : product._id;
  const cartQuantity = cartItems[cartKey] || 0;

  const nextImage = e => {
    e.stopPropagation();
    if (isInactive) return;
    setCurrentImageIndex(prev => (prev + 1) % displayImages.length);
  };

  const prevImage = e => {
    e.stopPropagation();
    if (isInactive) return;
    setCurrentImageIndex(
      prev => (prev - 1 + displayImages.length) % displayImages.length
    );
  };

  const handleCardClick = () => {
    navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
    window.scrollTo(0, 0);
  };

  // 🎯 HANDLER PARA SELEÇÃO DE COR
  const handleColorSelect = (e, variantId) => {
    e.stopPropagation();
    setSelectedVariant(variantId === selectedVariant ? null : variantId);
    setCurrentImageIndex(0); // Reset para primeira imagem da variante
  };

  // 🎯 HANDLER PARA ADICIONAR AO CARRINHO
  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (currentStock === 0) return;
    
    // Se tem variantes mas nenhuma selecionada, selecionar a primeira com stock
    if (hasVariants && !selectedVariant) {
      const firstAvailable = product.variants.find(v => v.stock > 0);
      if (firstAvailable) {
        setSelectedVariant(firstAvailable._id);
        addToCart(`${product._id}_${firstAvailable._id}`);
      }
    } else {
      addToCart(cartKey);
    }
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
        <img
          className={`max-w-[90%] max-h-[90%] object-contain object-center transition-all duration-300 ${
            isInactive ? 'opacity-40' : ''
          }`}
          src={displayImages[currentImageIndex]}
          alt={product.name}
          loading='lazy'
        />

        {/* Overlay de indisponível */}
        {isInactive && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/5'>
            <div className='text-gray-600 px-3 py-1.5 rounded-md font-medium text-xs tracking-wide uppercase'>
              Indisponível
            </div>
          </div>
        )}

        {/* 🎯 INDICADOR DE STOCK BAIXO */}
        {!isInactive && currentStock > 0 && currentStock <= 3 && (
          <div className='absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium'>
            Últimas {currentStock}!
          </div>
        )}

        {/* Setas de navegação */}
        {!isInactive && displayImages.length > 1 && (
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

        {/* Indicadores (pontos) */}
        {!isInactive && displayImages.length > 1 && (
          <div className='absolute bottom-2 z-10 left-0 right-0 flex justify-center gap-1.5'>
            {displayImages.map((_, index) => (
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

        {/* 🎯 BOLINHAS DE CORES */}
        {hasVariants && (
          <div className='flex items-center gap-1.5 mt-2 flex-wrap'>
            {product.variants.map((variant) => {
              const variantOutOfStock = variant.stock === 0;
              const isSelected = selectedVariant === variant._id;
              
              return (
                <button
                  key={variant._id}
                  onClick={(e) => handleColorSelect(e, variant._id)}
                  title={`${variant.color}${variantOutOfStock ? ' (Esgotado)' : ''}`}
                  className={`
                    relative w-5 h-5 md:w-6 md:h-6 rounded-full transition-all duration-200
                    ${isSelected 
                      ? 'ring-2 ring-offset-1 ring-primary scale-110' 
                      : 'hover:scale-105'
                    }
                    ${variantOutOfStock ? 'opacity-40' : ''}
                  `}
                  style={{ backgroundColor: variant.colorCode }}
                  disabled={variantOutOfStock}
                >
                  {/* X para variantes esgotadas */}
                  {variantOutOfStock && (
                    <span className='absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow-md'>
                      ✕
                    </span>
                  )}
                  {/* Borda branca para cores claras */}
                  <span 
                    className='absolute inset-0 rounded-full border border-gray-300'
                    style={{ 
                      borderColor: isLightColor(variant.colorCode) ? '#d1d5db' : 'transparent' 
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}

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
              {currentPrice.offerPrice.toLocaleString('pt-PT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
            </p>
            {currentPrice.offerPrice < currentPrice.price && (
              <p
                className={`text-gray-500/60 text-xs md:text-sm line-through ${
                  isInactive ? 'opacity-60' : ''
                }`}
              >
                {currentPrice.price.toLocaleString('pt-PT', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {currency}
              </p>
            )}
          </div>

          {/* Botão de carrinho */}
          <div
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className='text-primary'
          >
            {isInactive || currentStock === 0 ? (
              <div className='flex items-center justify-center gap-1 bg-gray-100 border border-gray-300 w-20 sm:w-24 md:w-28 h-10 sm:h-11 md:h-12 rounded-lg text-xs sm:text-sm font-medium cursor-not-allowed opacity-70'>
                <span className='text-gray-500'>Esgotado</span>
              </div>
            ) : cartQuantity === 0 ? (
              <button
                className='flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 w-20 sm:w-24 md:w-28 h-10 sm:h-11 md:h-12 rounded-lg hover:bg-primary/20 transition-colors text-sm sm:text-base md:text-lg font-medium shadow-sm active:scale-95'
                onClick={handleAddToCart}
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
                    removeFromCart(cartKey);
                  }}
                  className='cursor-pointer text-lg sm:text-xl md:text-2xl px-2 sm:px-3 md:px-4 h-full flex items-center justify-center hover:bg-primary/20 rounded-l-lg transition-colors active:scale-95 font-bold'
                >
                  -
                </button>
                <span className='w-6 sm:w-8 md:w-10 text-center text-sm sm:text-base md:text-lg font-semibold'>
                  {cartQuantity}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    // 🎯 VERIFICAR STOCK ANTES DE ADICIONAR
                    if (cartQuantity < currentStock) {
                      addToCart(cartKey);
                    }
                  }}
                  disabled={cartQuantity >= currentStock}
                  className={`cursor-pointer text-lg sm:text-xl md:text-2xl px-2 sm:px-3 md:px-4 h-full flex items-center justify-center hover:bg-primary/20 rounded-r-lg transition-colors active:scale-95 font-bold ${
                    cartQuantity >= currentStock ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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

// 🎯 HELPER: Verificar se a cor é clara (para adicionar borda)
function isLightColor(hexColor) {
  if (!hexColor) return false;
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7;
}

ProductCard.displayName = 'ProductCard';

export default ProductCard;