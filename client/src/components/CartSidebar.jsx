import React, { useEffect, useState, useRef } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

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
  } = useAppContext();

  // Estado para animação e swipe
  const [isClosing, setIsClosing] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  // Fechar com animação
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowCartSidebar(false);
      setIsClosing(false);
      setDragX(0);
    }, 300);
  };

  // Fechar com ESC
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

  // Touch handlers para swipe
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    
    // Só permite arrastar para a direita (fechar)
    if (diff > 0) {
      setDragX(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Se arrastou mais de 100px, fecha
    if (dragX > 100) {
      handleClose();
    } else {
      // Volta à posição original com animação
      setDragX(0);
    }
  };

  // Criar array de produtos no carrinho
  const cartArray = Object.keys(cartItems)
    .map((key) => {
      const product = products.find((item) => item._id === key);
      return product ? { ...product, quantity: cartItems[key] } : null;
    })
    .filter(Boolean);

  // Ir para checkout (Cart.jsx)
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

  if (!showCartSidebar) return null;

  return (
    <>
      {/* Overlay - clicável para fechar */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 right-0 h-full w-[85%] sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isClosing ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{
          transform: isClosing 
            ? 'translateX(100%)' 
            : `translateX(${dragX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Indicador de swipe (mobile) */}
        <div className='sm:hidden absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gray-300 rounded-r-full opacity-50' />
        
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
            className='p-2 hover:bg-gray-200 rounded-full transition-colors'
            aria-label='Fechar carrinho'
          >
            <X className='w-5 h-5 text-gray-600' />
          </button>
        </div>

        {/* Cart Items */}
        <div className='flex-1 overflow-y-auto'>
          {cartArray.length === 0 ? (
            // Carrinho Vazio
            <div className='flex flex-col items-center justify-center h-full px-6 text-center'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                <ShoppingBag className='w-10 h-10 text-gray-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                O seu carrinho está vazio
              </h3>
              <p className='text-gray-500 text-sm mb-6'>
                Ainda não adicionou produtos ao carrinho
              </p>
              <button
                onClick={handleContinueShopping}
                className='px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dull transition-colors'
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            // Lista de Produtos
            <div className='divide-y divide-gray-100'>
              {cartArray.map((product) => (
                <div
                  key={product._id}
                  className='p-4 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex gap-3'>
                    {/* Imagem do Produto */}
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className='w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0'
                      onClick={() => handleProductClick(product)}
                    />

                    {/* Detalhes do Produto */}
                    <div className='flex-1 min-w-0'>
                      <h3
                        className='font-medium text-gray-800 text-sm leading-tight cursor-pointer hover:text-primary transition-colors line-clamp-2'
                        onClick={() => handleProductClick(product)}
                      >
                        {product.name}
                      </h3>
                      
                      <p className='text-primary font-bold mt-1'>
                        {currency} {product.offerPrice.toFixed(2)}
                      </p>

                      {/* Controlos de Quantidade */}
                      <div className='flex items-center justify-between mt-2'>
                        <div className='flex items-center border border-gray-200 rounded-lg overflow-hidden'>
                          <button
                            onClick={() => {
                              if (product.quantity > 1) {
                                updateCartItem(product._id, product.quantity - 1);
                              }
                            }}
                            className='p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-50'
                            disabled={product.quantity <= 1}
                          >
                            <Minus className='w-3.5 h-3.5 text-gray-600' />
                          </button>
                          <span className='px-3 py-1 text-sm font-medium min-w-[36px] text-center'>
                            {product.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItem(product._id, product.quantity + 1)}
                            className='p-1.5 hover:bg-gray-100 transition-colors'
                          >
                            <Plus className='w-3.5 h-3.5 text-gray-600' />
                          </button>
                        </div>

                        {/* Botão Remover */}
                        <button
                          onClick={() => updateCartItem(product._id, 0)}
                          className='p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                          aria-label='Remover produto'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Subtotal & Ações */}
        {cartArray.length > 0 && (
          <div className='border-t border-gray-200 bg-white p-5 space-y-4'>
            {/* Subtotal */}
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Subtotal</span>
              <span className='text-xl font-bold text-gray-800'>
                {currency} {getCartAmount().toFixed(2)}
              </span>
            </div>

            <p className='text-xs text-gray-500 text-center'>
              Portes e descontos calculados no checkout
            </p>

            {/* Botões de Ação */}
            <div className='space-y-3'>
              {/* Botão Principal - Finalizar Compra */}
              <button
                onClick={handleCheckout}
                className='w-full py-3.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-dull transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-[0.98]'
              >
                Finalizar Compra
                <ArrowRight className='w-5 h-5' />
              </button>

              {/* Botão Secundário - Continuar a Comprar */}
              <button
                onClick={handleContinueShopping}
                className='w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors'
              >
                Continuar a Comprar
              </button>
            </div>

            {/* Link para ver carrinho detalhado (opcional) */}
            <button
              onClick={handleCheckout}
              className='w-full text-center text-sm text-primary hover:underline flex items-center justify-center gap-1'
            >
              Ver carrinho completo
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        )}

        {/* Dica de swipe (mobile only) */}
        <div className='sm:hidden absolute bottom-32 left-1/2 -translate-x-1/2 text-xs text-gray-400 flex items-center gap-1 pointer-events-none'>
          <span>Arraste para fechar</span>
          <ArrowRight className='w-3 h-3' />
        </div>
      </div>
    </>
  );
};

export default CartSidebar;