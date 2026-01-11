import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateCartItem,
    removeFromCart,
    getCartCount,
    getCartAmount,
    navigate,
    user,
    setShowUserLogin,
    axios,
    getAvailableStock,
    validateCart,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  // Converter cartItems para array com dados completos
  useEffect(() => {
    const tempArray = [];
    
    for (const productId in cartItems) {
      const quantity = cartItems[productId];
      if (quantity <= 0) continue;
      
      const product = products.find(p => p._id === productId);
      if (!product) continue;
      
      const availableStock = product.stock || 0;
      
      tempArray.push({
        productId,
        product,
        quantity,
        availableStock,
        displayImage: product.image?.[0] || '',
        displayPrice: product.price,
        displayOfferPrice: product.offerPrice,
        colorName: product.color || null,
        colorCode: product.colorCode || null,
      });
    }
    
    setCartArray(tempArray);
  }, [cartItems, products]);

  // Handlers
  const handleQuantityChange = async (productId, newQuantity) => {
    const item = cartArray.find(i => i.productId === productId);
    if (!item) return;
    
    if (newQuantity > item.availableStock) {
      toast.error(`Apenas ${item.availableStock} unidade(s) disponível(eis)`);
      return;
    }
    
    await updateCartItem(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    await updateCartItem(productId, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    
    if (cartArray.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }
    
    // Validar stock antes do checkout
    setIsValidating(true);
    
    try {
      const validation = await validateCart();
      
      if (!validation.valid) {
        const errorMessages = validation.errors
          .map(e => e.message || `${e.productName}: apenas ${e.available} disponível`)
          .join('\n');
        toast.error(`Problemas no carrinho:\n${errorMessages}`);
        setIsValidating(false);
        return;
      }
      
      navigate('/checkout');
    } catch (error) {
      toast.error('Erro ao validar carrinho');
    } finally {
      setIsValidating(false);
    }
  };

  // Se carrinho vazio
  if (cartArray.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <img 
          src={assets.empty_cart_icon || assets.box_icon} 
          alt="Carrinho vazio" 
          className="w-24 h-24 opacity-50 mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          O seu carrinho está vazio
        </h2>
        <p className="text-gray-500 mb-6 text-center">
          Adicione produtos ao carrinho para continuar a compra
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dull transition-colors"
        >
          Ver Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Carrinho de Compras ({getCartCount()} {getCartCount() === 1 ? 'item' : 'itens'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2 space-y-4">
            {cartArray.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-lg shadow-sm p-4 flex gap-4"
              >
                {/* Imagem */}
                <div 
                  className="w-24 h-24 flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/products/${item.product.category?.toLowerCase()}/${item.productId}`)}
                >
                  <img
                    src={item.displayImage}
                    alt={item.product.name}
                    className="w-full h-full object-contain rounded"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-medium text-gray-900 truncate cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/products/${item.product.category?.toLowerCase()}/${item.productId}`)}
                  >
                    {item.product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500">{item.product.category}</p>
                  
                  {/* Cor (se definida) */}
                  {item.colorName && (
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.colorCode || '#ccc' }}
                      />
                      <span className="text-sm text-gray-600">{item.colorName}</span>
                    </div>
                  )}

                  {/* Stock baixo */}
                  {item.availableStock > 0 && item.availableStock <= 3 && (
                    <p className="text-xs text-orange-500 mt-1">
                      ⚠️ Apenas {item.availableStock} em stock
                    </p>
                  )}

                  {/* Preço */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-semibold text-primary">
                      {item.displayOfferPrice.toFixed(2)} {currency}
                    </span>
                    {item.displayPrice !== item.displayOfferPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {item.displayPrice.toFixed(2)} {currency}
                      </span>
                    )}
                  </div>

                  {/* Quantidade e Remover */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                          item.quantity <= 1
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        -
                      </button>
                      
                      <select
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                        className="w-16 text-center border border-gray-300 rounded py-1 px-2"
                      >
                        {Array.from(
                          { length: Math.min(20, item.availableStock) },
                          (_, i) => i + 1
                        ).map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.availableStock}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                          item.quantity >= item.availableStock
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-red-500 hover:text-red-600 text-sm font-medium"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo do Pedido
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({getCartCount()} itens)</span>
                  <span className="font-medium">{getCartAmount().toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envio</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">
                    {getCartAmount().toFixed(2)} {currency}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isValidating}
                className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dull transition-colors disabled:opacity-50"
              >
                {isValidating ? 'A validar...' : 'Finalizar Compra'}
              </button>

              <button
                onClick={() => navigate('/products')}
                className="w-full mt-3 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Continuar a Comprar
              </button>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span>🔒</span>
                  <span>Pagamento Seguro</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🚚</span>
                  <span>Envio Grátis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;