import React, { useState, useEffect, memo } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { ShoppingBag, Plus, Minus } from 'lucide-react';

const ProductCard = memo(({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate, getProductFamily } =
    useAppContext();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [familyProducts, setFamilyProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(product);
  const [isColorTransitioning, setIsColorTransitioning] = useState(false);

  // 🎯 Buscar produtos da mesma família
  useEffect(() => {
    const fetchFamily = async () => {
      if (product?.productFamily) {
        const family = await getProductFamily(product.productFamily);
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

  const displayProduct = selectedProduct || product;
  const isInactive = !displayProduct.inStock || displayProduct.stock <= 0;

  // Trocar para outro produto da família
  const handleColorClick = (familyProduct, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (familyProduct._id === displayProduct._id) return;
    
    setIsColorTransitioning(true);
    setTimeout(() => {
      setSelectedProduct(familyProduct);
      setCurrentImageIndex(0);
      setTimeout(() => setIsColorTransitioning(false), 50);
    }, 150);
  };

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
    
    const currentInCart = cartItems[displayProduct._id] || 0;
    if (currentInCart >= displayProduct.stock) return;
    
    addToCart(displayProduct._id);
  };

  const handleRemoveFromCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    removeFromCart(displayProduct._id);
  };

  const cartQuantity = cartItems[displayProduct._id] || 0;
  const canAddMore = cartQuantity < displayProduct.stock;

  // Formatar preço
  const formatPrice = (price) => {
    return price.toLocaleString('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white w-full transition-all duration-300 flex flex-col h-full relative group ${
        isInactive ? 'opacity-90 cursor-default' : 'cursor-pointer'
      }`}
    >
      {/* Image Container */}
      <div className='relative flex items-center justify-center bg-gray-50/50 rounded-lg overflow-hidden aspect-square'>
        
        {/* Imagem */}
        <div className={`
          w-full h-full flex items-center justify-center p-4
          transition-all duration-150 ease-out
          ${isColorTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}>
          <img
            className={`max-w-full max-h-full object-contain transition-all duration-300 ${
              isInactive ? 'opacity-40 grayscale' : 'group-hover:scale-105'
            }`}
            src={displayProduct.image[currentImageIndex]}
            alt={displayProduct.name}
            loading='lazy'
          />
        </div>

        {/* Badge Esgotado - único badge */}
        {isInactive && (
          <div className='absolute top-2 left-2 bg-gray-900/80 text-white text-[10px] px-2 py-1 rounded font-medium uppercase tracking-wider'>
            Esgotado
          </div>
        )}

        {/* Indicadores de imagem (pontos) - só aparece no hover */}
        {!isInactive && displayProduct.image.length > 1 && (
          <div className='absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
            {displayProduct.image.map((_, index) => (
              <button
                key={index}
                onClick={e => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentImageIndex === index
                    ? 'bg-gray-800 w-4'
                    : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Setas de navegação - só aparece no hover */}
        {!isInactive && displayProduct.image.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white'
            >
              <img src={assets.arrow_left} alt='' className='w-3 h-3' />
            </button>
            <button
              onClick={nextImage}
              className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white'
            >
              <img src={assets.arrow_right} alt='' className='w-3 h-3' />
            </button>
          </>
        )}
      </div>

      {/* Product Info */}
      <div className='pt-3 pb-2 px-1 flex flex-col flex-grow'>
        
        {/* Bolinhas de Cor */}
        {familyProducts.length > 1 && (
          <div className='flex items-center gap-2 mb-2'>
            {familyProducts.slice(0, 5).map((familyProduct) => {
              const isSelected = familyProduct._id === displayProduct._id;
              const familyOutOfStock = (familyProduct.stock || 0) <= 0;
              const isLightColor = familyProduct.colorCode && 
                ['#FFFFFF', '#FFF', '#ffffff', '#fff'].includes(familyProduct.colorCode);

              return (
                <button
                  key={familyProduct._id}
                  onClick={(e) => handleColorClick(familyProduct, e)}
                  onMouseEnter={() => handleColorHover(familyProduct)}
                  title={`${familyProduct.color || familyProduct.name}${familyOutOfStock ? ' (Esgotado)' : ''}`}
                  className={`
                    relative w-5 h-5 rounded-full transition-all duration-200
                    ${isSelected 
                      ? 'ring-2 ring-offset-1 ring-gray-800' 
                      : 'hover:scale-110'
                    }
                    ${familyOutOfStock ? 'opacity-40' : ''}
                    ${isLightColor ? 'border border-gray-300' : ''}
                  `}
                  style={{ backgroundColor: familyProduct.colorCode || '#ccc' }}
                >
                  {familyOutOfStock && (
                    <span className='absolute inset-0 flex items-center justify-center'>
                      <svg className='w-2.5 h-2.5 text-gray-600' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
                        <path d='M18 6L6 18M6 6l12 12' />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
            {familyProducts.length > 5 && (
              <span className='text-xs text-gray-400'>+{familyProducts.length - 5}</span>
            )}
          </div>
        )}

        {/* Nome do Produto */}
        <h3
          className={`text-gray-900 font-medium text-sm leading-snug line-clamp-2 transition-opacity duration-150 ${
            isInactive ? 'opacity-60' : ''
          } ${isColorTransitioning ? 'opacity-0' : 'opacity-100'}`}
        >
          {displayProduct.name}
        </h3>

        {/* Preço + Botão Carrinho */}
        <div className={`mt-auto pt-3 flex items-end justify-between transition-opacity duration-150 ${isColorTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {/* Preço */}
          <div>
            {displayProduct.offerPrice < displayProduct.price && (
              <p className='text-gray-400 text-xs line-through'>
                {currency}{formatPrice(displayProduct.price)}
              </p>
            )}
            <p className={`text-gray-900 font-semibold text-base ${isInactive ? 'opacity-60' : ''}`}>
              {currency}{formatPrice(displayProduct.offerPrice)}
            </p>
          </div>

          {/* Botão Carrinho */}
          <div onClick={e => e.stopPropagation()}>
            {isInactive ? (
              <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center'>
                <ShoppingBag className='w-4 h-4 text-gray-400' />
              </div>
            ) : cartQuantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className='w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all active:scale-95'
              >
                <ShoppingBag className='w-4 h-4 text-gray-600' />
              </button>
            ) : (
              <div className='flex items-center gap-0.5 bg-white border border-gray-200 rounded-full shadow-sm px-1 py-1'>
                <button
                  onClick={handleRemoveFromCart}
                  className='w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors'
                >
                  <Minus className='w-3 h-3 text-gray-600' />
                </button>
                <span className='w-5 text-center text-sm font-medium text-gray-800'>
                  {cartQuantity}
                </span>
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddMore}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canAddMore ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <Plus className='w-3 h-3 text-gray-600' />
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