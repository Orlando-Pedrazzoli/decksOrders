import React, { useEffect, useState, useRef } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const CartSidebar = () => {
  const {
    showCartSidebar,
    setShowCartSidebar,
    cartItems,
    products,
    currency,
    updateCartItem,
    removeFromCart,
    getCartCount,
    getCartAmount,
    navigate,
    findProduct,
    axios,
  } = useAppContext();

  const [isVisible, setIsVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  
  // Estado para produtos carregados (inclui os buscados do servidor)
  const [loadedProducts, setLoadedProducts] = useState({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Estado para countdown de fecho automático
  const [closeCountdown, setCloseCountdown] = useState(3);

  useEffect(() => {
    if (showCartSidebar) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
      // Reset countdown quando sidebar abre
      setCloseCountdown(3);
    }
  }, [showCartSidebar]);

  // Carregar produtos que não estão no cache quando o sidebar abre
  useEffect(() => {
    const loadMissingProducts = async () => {
      if (!showCartSidebar || Object.keys(cartItems).length === 0) return;
      
      const missingIds = Object.keys(cartItems).filter(id => {
        const found = findProduct(id);
        return !found && !loadedProducts[id];
      });
      
      if (missingIds.length === 0) return;
      
      setIsLoadingProducts(true);
      
      try {
        // Buscar produtos em falta do servidor
        const { data } = await axios.post('/api/product/by-ids', { ids: missingIds });
        
        if (data.success && data.products) {
          const newProducts = {};
          data.products.forEach(product => {
            newProducts[product._id] = product;
          });
          setLoadedProducts(prev => ({ ...prev, ...newProducts }));
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        
        // FALLBACK: Buscar um por um se a rota by-ids não existir
        for (const id of missingIds) {
          try {
            const { data } = await axios.get(`/api/product/${id}`);
            if (data.success && data.product) {
              setLoadedProducts(prev => ({ ...prev, [id]: data.product }));
            }
          } catch (err) {
            console.error(`Erro ao buscar produto ${id}:`, err);
          }
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    loadMissingProducts();
  }, [showCartSidebar, cartItems, products]);

  // Função para encontrar produto (context + loadedProducts)
  const getProduct = (productId) => {
    const found = findProduct(productId);
    if (found) return found;
    return loadedProducts[productId] || null;
  };

  // Construir array do carrinho com fallback
  const cartArray = Object.keys(cartItems)
    .map((key) => {
      const product = getProduct(key);
      return product ? { ...product, quantity: cartItems[key] } : null;
    })
    .filter(Boolean);

  // Verificar se há itens no carrinho mas produtos não carregados
  const hasUnloadedProducts = Object.keys(cartItems).length > 0 && 
    cartArray.length < Object.keys(cartItems).length;

  // Verificar se carrinho está vazio
  const isCartEmpty = cartArray.length === 0 && !hasUnloadedProducts && !isLoadingProducts;

  // Fecho automático quando carrinho está vazio
  useEffect(() => {
    if (showCartSidebar && isCartEmpty) {
      const timer = setInterval(() => {
        setCloseCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      // Reset countdown se carrinho deixar de estar vazio
      setCloseCountdown(3);
    }
  }, [showCartSidebar, isCartEmpty]);

  const handleClose = () => {
    setIsVisible(false);
    setDragOffset(0);
    setTimeout(() => {
      setShowCartSidebar(false);
    }, 300);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    
    if (showCartSidebar) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [showCartSidebar]);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    if (diff > 0) {
      setDragOffset(Math.min(diff, 300));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragOffset > 80) {
      handleClose();
    } else {
      setDragOffset(0);
    }
  };

  const handleCheckout = () => {
    setShowCartSidebar(false);
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    handleClose();
  };

  const handleProductClick = (product) => {
    setShowCartSidebar(false);
    navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
  };

  // Validar stock antes de aumentar
  const handleIncrease = (product) => {
    const availableStock = product.stock || 0;
    const currentQty = product.quantity;
    
    if (currentQty >= availableStock) {
      toast.error(`Apenas ${availableStock} unidade(s) disponível(eis)`);
      return;
    }
    
    updateCartItem(product._id, currentQty + 1);
  };

  // Helper: verificar se cor é clara
  const isLightColor = (color) => {
    if (!color) return false;
    const hex = color.replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 200;
  };

  // Componente para renderizar bolinha de cor (simples ou dupla)
  const ColorBall = ({ code1, code2, size = 20, title }) => {
    const isDual = code2 && code2 !== code1;
    const isLight1 = isLightColor(code1);
    const isLight2 = isLightColor(code2);
    const needsBorder = isLight1 || (isDual && isLight2);
    
    return (
      <div
        className={`absolute -bottom-1 -right-1 rounded-full border-2 border-white shadow-sm ${
          needsBorder ? 'ring-1 ring-gray-300' : ''
        }`}
        style={{ width: size, height: size }}
        title={title}
      >
        {isDual ? (
          <div 
            className='w-full h-full rounded-full overflow-hidden'
            style={{
              background: `linear-gradient(135deg, ${code1} 50%, ${code2} 50%)`,
            }}
          />
        ) : (
          <div 
            className='w-full h-full rounded-full'
            style={{ backgroundColor: code1 || '#ccc' }}
          />
        )}
      </div>
    );
  };

  if (!showCartSidebar) return null;

  return (
    <div className='fixed inset-0 z-50'>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
      />

      {/* Sidebar Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className='absolute top-0 right-0 h-full w-[85%] sm:w-[420px] bg-white shadow-2xl flex flex-col'
        style={{
          transform: dragOffset > 0 
            ? `translateX(${dragOffset}px)` 
            : isVisible 
              ? 'translateX(0)' 
              : 'translateX(100%)',
          transition: isDragging ? 'none' : 'transform 300ms ease-out'
        }}
      >
        {/* Indicador de swipe (mobile) */}
        <div className='sm:hidden absolute left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-gray-300 rounded-full opacity-40' />
        
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50'>
          <div className='flex items-center gap-3'>
            <ShoppingBag className='w-5 h-5 text-primary' />
            <h2 className='text-lg font-bold text-gray-800'>
              O Meu Carrinho
            </h2>
            <span className='bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full'>
              {getCartCount()}
            </span>
          </div>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer'
            aria-label='Fechar carrinho'
          >
            <X className='w-5 h-5 text-gray-600' />
          </button>
        </div>

        {/* Cart Items */}
        <div className='flex-1 overflow-y-auto'>
          {/* Loading state enquanto carrega produtos */}
          {isLoadingProducts && hasUnloadedProducts ? (
            <div className='flex flex-col items-center justify-center h-full px-6 text-center'>
              <Loader2 className='w-10 h-10 text-primary animate-spin mb-4' />
              <p className='text-gray-600'>A carregar produtos...</p>
            </div>
          ) : isCartEmpty ? (
            <div className='flex flex-col items-center justify-center h-full px-6 text-center'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                <ShoppingBag className='w-10 h-10 text-gray-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                O seu carrinho está vazio
              </h3>
              <p className='text-gray-500 text-sm mb-4'>
                Ainda não adicionou produtos ao carrinho
              </p>
              
              {/* Countdown indicator */}
              <div className='mb-6 flex items-center gap-2 text-gray-500'>
                <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                </svg>
                <span className='text-sm'>A fechar em {closeCountdown}s...</span>
              </div>

              <button
                onClick={handleContinueShopping}
                className='px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dull transition-colors cursor-pointer'
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            <div className='divide-y divide-gray-100'>
              {cartArray.map((product) => {
                const availableStock = product.stock || 0;
                const canIncrease = product.quantity < availableStock;
                const isLowStock = availableStock > 0 && availableStock <= 3;

                return (
                  <div
                    key={product._id}
                    className='p-4 hover:bg-gray-50 transition-colors'
                  >
                    <div className='flex gap-3'>
                      {/* Imagem do Produto */}
                      <div className='relative'>
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className='w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0'
                          onClick={() => handleProductClick(product)}
                        />
                        {/* Bolinha de Cor - Suporta Dual Colors */}
                        {product.colorCode && (
                          <ColorBall
                            code1={product.colorCode}
                            code2={product.colorCode2}
                            size={20}
                            title={product.color || 'Cor'}
                          />
                        )}
                      </div>

                      {/* Detalhes do Produto */}
                      <div className='flex-1 min-w-0'>
                        <h3
                          className='font-medium text-gray-800 text-sm leading-tight cursor-pointer hover:text-primary transition-colors line-clamp-2'
                          onClick={() => handleProductClick(product)}
                        >
                          {product.name}
                        </h3>
                        
                        {/* Nome da Cor */}
                        {product.color && (
                          <p className='text-xs text-gray-500 mt-0.5'>
                            Cor: {product.color}
                          </p>
                        )}
                        
                        <p className='text-primary font-bold mt-1'>
                          {currency} {product.offerPrice.toFixed(2)}
                        </p>

                        {/* Badge Stock Baixo */}
                        {isLowStock && (
                          <p className='text-xs text-orange-600 font-medium mt-0.5'>
                            Últimas {availableStock}!
                          </p>
                        )}

                        {/* Controlos de Quantidade */}
                        <div className='flex items-center justify-between mt-2'>
                          <div className='flex items-center border border-gray-200 rounded-lg overflow-hidden'>
                            <button
                              onClick={() => {
                                if (product.quantity > 1) {
                                  updateCartItem(product._id, product.quantity - 1);
                                }
                              }}
                              className='p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer'
                              disabled={product.quantity <= 1}
                            >
                              <Minus className='w-3.5 h-3.5 text-gray-600' />
                            </button>
                            <span className='px-3 py-1 text-sm font-medium min-w-[36px] text-center'>
                              {product.quantity}
                            </span>
                            {/* Botão + com validação de stock */}
                            <button
                              onClick={() => handleIncrease(product)}
                              disabled={!canIncrease}
                              className={`p-1.5 transition-colors cursor-pointer ${
                                canIncrease 
                                  ? 'hover:bg-gray-100' 
                                  : 'opacity-50 cursor-not-allowed bg-gray-50'
                              }`}
                              title={!canIncrease ? 'Stock máximo atingido' : 'Adicionar mais'}
                            >
                              <Plus className='w-3.5 h-3.5 text-gray-600' />
                            </button>
                          </div>

                          {/* Botão Remover */}
                          <button
                            onClick={() => updateCartItem(product._id, 0)}
                            className='p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer'
                            aria-label='Remover produto'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Indicador de itens ainda a carregar */}
              {hasUnloadedProducts && !isLoadingProducts && (
                <div className='p-4 text-center text-gray-500 text-sm'>
                  <Loader2 className='w-4 h-4 animate-spin inline mr-2' />
                  A carregar mais itens...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartArray.length > 0 && (
          <div className='border-t border-gray-200 bg-white p-5 space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Subtotal</span>
              <span className='text-xl font-bold text-gray-800'>
                {currency} {getCartAmount().toFixed(2)}
              </span>
            </div>

            <p className='text-xs text-gray-500 text-center'>
              Portes e descontos calculados no checkout
            </p>

            <div className='space-y-3'>
              <button
                onClick={handleCheckout}
                className='w-full py-3.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-dull transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-[0.98] cursor-pointer'
              >
                Finalizar Compra
                <ArrowRight className='w-5 h-5' />
              </button>

              <button
                onClick={handleContinueShopping}
                className='w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer'
              >
                Continuar a Comprar
              </button>
            </div>

            <button
              onClick={handleCheckout}
              className='w-full text-center text-sm text-primary hover:underline flex items-center justify-center gap-1 cursor-pointer'
            >
              Ver carrinho completo
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;