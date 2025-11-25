import React, { useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
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

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowCartSidebar(false);
    };
    
    if (showCartSidebar) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [showCartSidebar, setShowCartSidebar]);

  // Criar array de produtos no carrinho
  const cartArray = Object.keys(cartItems)
    .map((key) => {
      const product = products.find((item) => item._id === key);
      return product ? { ...product, quantity: cartItems[key] } : null;
    })
    .filter(Boolean);

  const handleViewCart = () => {
    setShowCartSidebar(false);
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    setShowCartSidebar(false);
  };

  const handleProductClick = (product) => {
    setShowCartSidebar(false);
    navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
  };

  if (!showCartSidebar) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black/50 z-50 transition-opacity duration-300'
        onClick={() => setShowCartSidebar(false)}
      />

      {/* Sidebar */}
      <div className='fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out'>
        
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50'>
          <div className='flex items-center gap-3'>
            <ShoppingBag className='w-6 h-6 text-primary' />
            <h2 className='text-lg font-bold text-gray-800'>
              Carrinho ({getCartCount()})
            </h2>
          </div>
          <button
            onClick={() => setShowCartSidebar(false)}
            className='p-2 hover:bg-gray-200 rounded-full transition-colors'
            aria-label='Fechar carrinho'
          >
            <X className='w-5 h-5 text-gray-600' />
          </button>
        </div>

        {/* Cart Items */}
        <div className='flex-1 overflow-y-auto'>
          {cartArray.length === 0 ? (
            // Empty Cart
            <div className='flex flex-col items-center justify-center h-full px-6 text-center'>
              <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                <ShoppingBag className='w-12 h-12 text-gray-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                Carrinho vazio
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
            // Cart Items List
            <div className='divide-y divide-gray-100'>
              {cartArray.map((product) => (
                <div
                  key={product._id}
                  className='p-4 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex gap-4'>
                    {/* Product Image */}
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className='w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity'
                      onClick={() => handleProductClick(product)}
                    />

                    {/* Product Details */}
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

                      {/* Quantity Controls */}
                      <div className='flex items-center justify-between mt-3'>
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
                            <Minus className='w-4 h-4 text-gray-600' />
                          </button>
                          <span className='px-3 py-1 text-sm font-medium min-w-[40px] text-center'>
                            {product.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItem(product._id, product.quantity + 1)}
                            className='p-1.5 hover:bg-gray-100 transition-colors'
                          >
                            <Plus className='w-4 h-4 text-gray-600' />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => updateCartItem(product._id, 0)}
                          className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors'
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

        {/* Footer - Subtotal & Actions */}
        {cartArray.length > 0 && (
          <div className='border-t border-gray-200 bg-white p-6 space-y-4'>
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

            {/* Action Buttons */}
            <div className='space-y-3'>
              <button
                onClick={handleViewCart}
                className='w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dull transition-colors flex items-center justify-center gap-2'
              >
                Ver Carrinho
                <ArrowRight className='w-4 h-4' />
              </button>

              <button
                onClick={handleContinueShopping}
                className='w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors'
              >
                Continuar a Comprar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;