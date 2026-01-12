import React, { useState, useEffect, memo } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const ProductCard = memo(({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate, getProductFamily } =
    useAppContext();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [familyProducts, setFamilyProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(product);
  const [isColorTransitioning, setIsColorTransitioning] = useState(false);

  // 🎯 Buscar produtos da mesma família via API (com cache no contexto)
  useEffect(() => {
    const fetchFamily = async () => {
      if (product?.productFamily) {
        const family = await getProductFamily(product.productFamily);
        // Ordenar: produto atual primeiro, depois por cor
        const sorted = [...family].sort((a, b) => {
          if (a._id === product._id) return -1;
          if (b._id === product._id) return 1;
          return (a.color || '').localeCompare(b.color || '');
        });
        setFamilyProducts(sorted);
      } else {
        setFamilyProducts([]);
      }
    };
    fetchFamily();
  }, [product?.productFamily, product?._id, getProductFamily]);

  // Reset quando o produto base muda
  useEffect(() => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  }, [product?._id]);

  if (!product || !product.image || product.image.length === 0) return null;

  // Usar dados do produto selecionado
  const displayProduct = selectedProduct || product;
  const isInactive = !displayProduct.inStock || displayProduct.stock <= 0;
  const isLowStock = displayProduct.stock > 0 && displayProduct.stock <= 3;

  // 🎯 Trocar para outro produto da família COM TRANSIÇÃO
  const handleColorClick = (familyProduct, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (familyProduct._id === displayProduct._id) return;
    
    // Iniciar transição (fade out)
    setIsColorTransitioning(true);
    
    // Após fade-out, trocar produto
    setTimeout(() => {
      setSelectedProduct(familyProduct);
      setCurrentImageIndex(0);
      
      // Fade in
      setTimeout(() => {
        setIsColorTransitioning(false);
      }, 50);
    }, 150);
  };

  // 🎯 Hover na bolinha muda imagem (desktop)
  const handleColorHover = (familyProduct) => {
    if (familyProduct._id === displayProduct._id) return;
    setIsColorTransitioning(true);
    setTimeout(() => {
      setSelectedProduct(familyProduct);
      setCurrentImageIndex(0);
      setTimeout(() => setIsColorTransitioning(false), 50);
    }, 100);
  };

  const nextImage = e => {
    e.stopPropagation();
    if (isInactive) return;
    setCurrentImageIndex(prev => (prev + 1) % displayProduct.image.length);
  };

  const prevImage = e => {
    e.stopPropagation();
    if (isInactive) return;
    setCurrentImageIndex(
      prev => (prev - 1 + displayProduct.image.length) % displayProduct.image.length
    );
  };

  const handleCardClick = () => {
    navigate(`/products/${displayProduct.category.toLowerCase()}/${displayProduct._id}`);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isInactive) return;
    
    // Verificar stock antes de adicionar
    const currentInCart = cartItems[displayProduct._id] || 0;
    if (currentInCart >= displayProduct.stock) {
      return; // Não adiciona mais se já atingiu o limite
    }
    
    addToCart(displayProduct._id);
  };

  const handleRemoveFromCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    removeFromCart(displayProduct._id);
  };

  // Quantidade no carrinho do produto selecionado
  const cartQuantity = cartItems[displayProduct._id] || 0;
  const canAddMore = cartQuantity < displayProduct.stock;

  return (
    <div
      onClick={handleCardClick}
      className={`border border-gray-500/20 rounded-md p-2 bg-white w-full transition-all duration-300 flex flex-col h-full relative ${
        isInactive
          ? 'opacity-90 cursor-default'
          : 'hover:shadow-md cursor-pointer'
      }`}
    >
      {/* Image Container */}
      <div
        className='group relative flex items-center justify-center mb-3 overflow-hidden bg-gray-50 rounded-lg'
        style={{ aspectRatio: '1 / 1', minHeight: '160px' }}
      >
        {/* 🎯 Imagem com transição de cor */}
        <div className={`
          w-full h-full flex items-center justify-center
          transition-all duration-150 ease-out
          ${isColorTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}>
          <img
            className={`max-w-[90%] max-h-[90%] object-contain object-center transition-all duration-300 ${
              isInactive ? 'opacity-40' : ''
            }`}
            src={displayProduct.image[currentImageIndex]}
            alt={displayProduct.name}
            loading='lazy'
          />
        </div>

        {/* Badge Esgotado */}
        {isInactive && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/5'>
            <div className='text-gray-600 px-3 py-1.5 rounded-md font-medium text-xs tracking-wide uppercase'>
              Indisponível
            </div>
          </div>
        )}

        {/* Badge Stock Baixo */}
        {isLowStock && !isInactive && (
          <div className='absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-medium animate-pulse'>
            Últimas {displayProduct.stock}!
          </div>
        )}

        {/* Setas de navegação */}
        {!isInactive && displayProduct.image.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className='absolute z-10 left-2 sm:left-3 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 md:opacity-30 md:group-hover:opacity-100'
              aria-label='Imagem anterior'
            >
              <img src={assets.arrow_left} alt='' className='w-3 h-3 md:w-4 md:h-4' />
            </button>
            <button
              onClick={nextImage}
              className='absolute z-10 right-2 sm:right-3 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 md:opacity-30 md:group-hover:opacity-100'
              aria-label='Próxima imagem'
            >
              <img src={assets.arrow_right} alt='' className='w-3 h-3 md:w-4 md:h-4' />
            </button>
          </>
        )}

        {/* Indicadores (pontos) */}
        {!isInactive && displayProduct.image.length > 1 && (
          <div className='absolute bottom-2 z-10 left-0 right-0 flex justify-center gap-1.5'>
            {displayProduct.image.map((_, index) => (
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
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className='flex flex-col flex-grow text-gray-500/60 text-sm'>
        {/* Nome com transição */}
        <p
          className={`text-gray-700 font-medium text-base md:text-lg line-clamp-2 h-[3em] mt-1 transition-opacity duration-150 ${
            isInactive ? 'opacity-60' : ''
          } ${isColorTransitioning ? 'opacity-0' : 'opacity-100'}`}
        >
          {displayProduct.name}
        </p>

        {/* 🆕 BOLINHAS DE COR */}
        {familyProducts.length > 1 && (
          <div className='flex items-center gap-1.5 mt-2 flex-wrap'>
            {familyProducts.slice(0, 5).map((familyProduct) => {
              const isSelected = familyProduct._id === displayProduct._id;
              const familyStock = familyProduct.stock || 0;
              const familyOutOfStock = familyStock <= 0;
              const isLightColor = familyProduct.colorCode && 
                ['#FFFFFF', '#FFF', '#ffffff', '#fff'].includes(familyProduct.colorCode);

              return (
                <button
                  key={familyProduct._id}
                  onClick={(e) => handleColorClick(familyProduct, e)}
                  onMouseEnter={() => handleColorHover(familyProduct)}
                  onMouseLeave={() => {
                    // Voltar ao produto original no mouse leave (opcional)
                    // handleColorHover(product);
                  }}
                  title={`${familyProduct.color || familyProduct.name}${familyOutOfStock ? ' (Esgotado)' : ''}`}
                  className={`
                    relative w-6 h-6 md:w-7 md:h-7 rounded-full transition-all duration-200
                    ${isSelected 
                      ? 'ring-2 ring-offset-1 ring-gray-800 scale-110' 
                      : 'hover:scale-110'
                    }
                    ${familyOutOfStock ? 'opacity-50' : ''}
                    ${isLightColor ? 'border-2 border-gray-300' : 'border border-gray-200'}
                  `}
                  style={{ backgroundColor: familyProduct.colorCode || '#ccc' }}
                >
                  {/* X para esgotado */}
                  {familyOutOfStock && (
                    <span className='absolute inset-0 flex items-center justify-center'>
                      <svg className='w-3 h-3 text-gray-600' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
                        <path d='M18 6L6 18M6 6l12 12' />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
            {familyProducts.length > 5 && (
              <span className='text-xs text-gray-400 ml-1'>
                +{familyProducts.length - 5}
              </span>
            )}
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
          <div className={`transition-opacity duration-150 ${isColorTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <p
              className={`text-lg md:text-xl font-medium text-gray-700 ${
                isInactive ? 'opacity-60' : ''
              }`}
            >
              {displayProduct.offerPrice.toLocaleString('pt-PT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
            </p>
            {displayProduct.offerPrice < displayProduct.price && (
              <p
                className={`text-gray-500/60 text-xs md:text-sm line-through ${
                  isInactive ? 'opacity-60' : ''
                }`}
              >
                {displayProduct.price.toLocaleString('pt-PT', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {currency}
              </p>
            )}
          </div>

          {/* Botão Carrinho */}
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
            ) : !cartQuantity ? (
              <button
                className='flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 w-20 sm:w-24 md:w-28 h-10 sm:h-11 md:h-12 rounded-lg hover:bg-primary/20 transition-colors text-sm sm:text-base md:text-lg font-medium shadow-sm active:scale-95'
                onClick={handleAddToCart}
              >
                <img
                  src={assets.cart_icon}
                  alt='Adicionar'
                  className='w-4 sm:w-5 md:w-6'
                />
                Add
              </button>
            ) : (
              <div className='flex items-center justify-center gap-2 w-20 sm:w-24 md:w-28 h-10 sm:h-11 md:h-12 bg-primary/10 border border-primary/20 rounded-lg select-none shadow-sm'>
                <button
                  onClick={handleRemoveFromCart}
                  className='cursor-pointer text-lg sm:text-xl md:text-2xl px-2 sm:px-3 md:px-4 h-full flex items-center justify-center hover:bg-primary/20 rounded-l-lg transition-colors active:scale-95 font-bold'
                >
                  -
                </button>
                <span className='w-6 sm:w-8 md:w-10 text-center text-sm sm:text-base md:text-lg font-semibold'>
                  {cartQuantity}
                </span>
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddMore}
                  className={`cursor-pointer text-lg sm:text-xl md:text-2xl px-2 sm:px-3 md:px-4 h-full flex items-center justify-center rounded-r-lg transition-colors active:scale-95 font-bold ${
                    canAddMore ? 'hover:bg-primary/20' : 'opacity-50 cursor-not-allowed'
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

ProductCard.displayName = 'ProductCard';

export default ProductCard;