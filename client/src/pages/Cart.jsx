import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';
import { SEO } from '../components/seo';
import seoConfig from '../components/seo/seoConfig';

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItem,
    navigate,
    getCartAmount,
    axios,
    user,
    setCartItems,
    setShowUserLogin,
    isMobile,
    saveCartToStorage,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, mbway, multibanco
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const validPromoCode = 'BROTHER';

  // Auto-scroll to top and load data
  useEffect(() => {
    window.scrollTo(0, 0);
    if (products.length > 0 && cartItems) {
      updateCartArray();
    }
    if (user) {
      loadUserAddresses();
    }
  }, [products, cartItems, user]);

  const requireLogin = action => {
    if (!user) {
      setShowUserLogin(true);
      toast.error(`Por favor, inicie sessão para ${action}.`);
      return false;
    }
    return true;
  };

  const updateCartArray = () => {
    const tempArray = Object.keys(cartItems)
      .map(key => {
        const product = products.find(item => item._id === key);
        return product ? { ...product, quantity: cartItems[key] } : null;
      })
      .filter(Boolean);
    setCartArray(tempArray);
  };

  const loadUserAddresses = async () => {
    try {
      const { data } = await axios.post(
        '/api/address/get',
        {},
        { withCredentials: true }
      );

      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(prev => prev || data.addresses[0]);
        } else {
          setSelectedAddress(null);
        }
      }
    } catch (error) {
      console.error('Falha ao carregar as moradas:', error);
      toast.error('Falha ao carregar as moradas.');
    }
  };

  // ✅ FUNÇÃO calculateTotal
  const calculateTotal = () => {
    const subtotal = parseFloat(getCartAmount());
    let totalBeforeDiscount = subtotal;

    if (discountApplied) {
      const discount = subtotal * 0.3;
      totalBeforeDiscount -= discount;
    }
    return Math.max(0, totalBeforeDiscount).toFixed(2);
  };

  // ✅ FUNÇÃO handlePlaceOrder - APENAS PAGAMENTO ONLINE
  const handlePlaceOrder = async () => {
    if (!requireLogin('fazer a encomenda')) return;
    if (!selectedAddress) {
      return toast.error('Por favor, selecione uma morada de entrega.');
    }
    if (cartArray.length === 0) {
      return toast.error(
        'O seu carrinho está vazio. Adicione artigos antes de fazer uma encomenda.'
      );
    }

    setIsProcessing(true);
    try {
      // ✅ CALCULAR VALORES PARA MODELO Order COMPLETO
      const subtotal = parseFloat(getCartAmount());
      const discountAmount = discountApplied ? subtotal * 0.3 : 0;
      const finalAmount = subtotal - discountAmount;

      const orderData = {
        userId: user._id,
        items: cartArray.map(item => ({
          product: item._id,
          quantity: item.quantity,
        })),
        address: selectedAddress._id,
        originalAmount: subtotal,
        amount: finalAmount,
        discountAmount: discountAmount,
        discountPercentage: discountApplied ? 30 : 0,
        promoCode: discountApplied ? promoCode.toUpperCase() : '',
        paymentType: 'Online',
        paymentMethod: paymentMethod,
        isPaid: false,
      };

      console.log('📦 Dados da encomenda sendo enviados:', orderData);

      // ✅ STRIPE PAYMENT FLOW (Card, MB Way, Multibanco)
      console.log(`💳 Iniciando processo de pagamento ${paymentMethod}...`);

      const response = await axios.post('/api/order/stripe', orderData);

      console.log('✅ Resposta Stripe:', response.data);

      if (response.data.success && response.data.url) {
        console.log(
          '🚀 Redirecionando para Stripe Checkout:',
          response.data.url
        );

        // ✅ LIMPAR CARRINHO ANTES DE REDIRECIONAR
        const emptyCart = {};
        setCartItems(emptyCart);
        saveCartToStorage(emptyCart);

        // ✅ REDIRECIONAR PARA STRIPE
        window.location.replace(response.data.url);
      } else {
        console.error('❌ Erro na resposta do Stripe:', response.data);
        toast.error(
          response.data.message || 'Falha ao inicializar o pagamento.'
        );
      }
    } catch (error) {
      console.error('❌ Erro na encomenda:', error);

      // Mensagens de erro específicas
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Por favor, inicie sessão novamente.');
        if (isMobile) {
          localStorage.removeItem('mobile_auth_token');
        }
        setShowUserLogin(true);
      } else if (error.response?.status === 400) {
        toast.error(
          error.response?.data?.message ||
            'Dados inválidos. Verifique os detalhes.'
        );
      } else if (error.response?.status === 500) {
        toast.error('Erro interno do servidor. Tente novamente.');
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Problema de conectividade. Verifique a sua internet.');
      } else {
        toast.error(
          error.response?.data?.message ||
            'Falha ao processar a encomenda. Tente novamente.'
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromoCode = () => {
    if (!requireLogin('aplicar o código promocional')) return;

    if (promoCode.trim().toUpperCase() === validPromoCode) {
      setDiscountApplied(true);
      toast.success('Desconto de 30% aplicado!');
    } else {
      toast.error('Código promocional inválido. Experimente "BROTHER".');
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setDiscountApplied(false);
    toast('Código promocional removido.');
  };

  // ✅ FUNÇÃO PARA OBTER TEXTO DO BOTÃO DE PAGAMENTO
  const getPaymentButtonText = () => {
    if (isProcessing) return 'A Processar...';
    
    switch (paymentMethod) {
      case 'mbway':
        return 'Pagar com MB Way';
      case 'multibanco':
        return 'Gerar Referência Multibanco';
      case 'card':
      default:
        return 'Pagar com Cartão';
    }
  };

  // If cart is empty
  if (!products.length || !cartItems || Object.keys(cartItems).length === 0) {
    return (
      <>
        {/* SEO - noindex porque é página privada */}
        <SEO 
          title={seoConfig.cart.title}
          description={seoConfig.cart.description}
          url={seoConfig.cart.url}
          noindex={true}
        />
        
        <div className='flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-gray-50'>
          <img
            src={assets.empty_cart}
            alt='Carrinho vazio'
            className='w-56 sm:w-64 md:w-72 mb-6 max-w-full'
          />
          <h3 className='text-xl sm:text-2xl font-semibold mb-3 text-gray-700'>
            O seu carrinho está vazio!
          </h3>
          <p className='text-gray-600 mb-6 max-w-md'>
            Parece que ainda não adicionou nada ao seu carrinho. Explore os nossos
            produtos e descubra algo de que goste!
          </p>
          <button
            onClick={() => navigate('/products')}
            className='bg-primary text-white px-7 py-3 rounded-lg shadow-md hover:bg-primary-dull transition-all duration-300 text-base font-medium active:scale-95'
          >
            Explorar produtos
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* SEO - noindex porque é página privada */}
      <SEO 
        title={seoConfig.cart.title}
        description={seoConfig.cart.description}
        url={seoConfig.cart.url}
        noindex={true}
      />

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-[calc(100vh-60px)]'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Cart Items Section */}
          <div className='lg:w-2/3'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6'>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0'>
                Carrinho de Compras ({getCartCount()} artigos)
              </h1>
              <button
                onClick={() => navigate('/products')}
                className='flex items-center text-primary-dark hover:underline text-sm sm:text-base font-medium'
              >
                Continuar a Comprar
                <img
                  src={assets.arrow_right_icon_colored}
                  alt='>'
                  className='ml-1 h-4 w-4'
                />
              </button>
            </div>

            <div className='bg-white rounded-xl shadow-lg overflow-hidden divide-y divide-gray-200'>
              {cartArray.map(product => (
                <div
                  key={product._id}
                  className='flex flex-col sm:flex-row items-center p-4 sm:p-6'
                >
                  <div className='flex items-center w-full sm:w-2/3 mb-4 sm:mb-0'>
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className='w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-transform duration-200 hover:scale-[1.02]'
                      onClick={() =>
                        navigate(
                          `/products/${product.category.toLowerCase()}/${
                            product._id
                          }`
                        )
                      }
                    />
                    <div className='ml-4 flex-grow'>
                      <h3 className='font-semibold text-lg text-gray-800'>
                        {product.name}
                      </h3>
                      <p className='text-sm text-gray-500 mt-1'>
                        Peso: {product.weight || 'N/A'}
                      </p>
                      <p className='font-medium text-gray-700 mt-2 text-base sm:hidden'>
                        {currency}{' '}
                        {(product.offerPrice * product.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className='flex justify-between items-center w-full sm:w-1/3 sm:justify-end sm:gap-8'>
                    <div className='flex items-center'>
                      <span className='mr-2 text-gray-600'>Qtd:</span>
                      <select
                        value={cartItems[product._id]}
                        onChange={e =>
                          updateCartItem(product._id, Number(e.target.value))
                        }
                        className='border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none cursor-pointer'
                      >
                        {[...Array(20).keys()].map(num => (
                          <option key={num + 1} value={num + 1}>
                            {num + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='text-right hidden sm:block'>
                      <p className='font-bold text-lg text-gray-800 flex items-baseline justify-end'>
                        <span className='mr-0.5'>{currency}</span>
                        <span>
                          {(product.offerPrice * product.quantity).toFixed(2)}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className='text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200 ml-4 cursor-pointer'
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Section */}
          <div className='lg:w-1/3'>
            <div className='bg-white rounded-xl shadow-lg p-6 sticky lg:top-8'>
              <h2 className='text-2xl font-bold mb-5 text-gray-800'>
                Finalizar Compra
              </h2>

              {/* Address Selection */}
              <div className='mb-6 border-b pb-6 border-gray-200'>
                <div className='flex justify-between items-center mb-3'>
                  <h3 className='font-semibold text-gray-700'>
                    Morada de Entrega
                  </h3>
                  <button
                    onClick={() =>
                      requireLogin('selecionar morada') &&
                      setShowAddress(!showAddress)
                    }
                    className='text-primary-dark text-sm hover:underline font-medium'
                  >
                    {showAddress ? 'Fechar' : 'Alterar'}
                  </button>
                </div>

                {selectedAddress ? (
                  <div className='bg-gray-50 p-4 rounded-lg text-sm text-gray-700 border border-gray-200'>
                    <p className='font-medium'>{selectedAddress.street}</p>
                    <p>
                      {selectedAddress.city}, {selectedAddress.state}{' '}
                      {selectedAddress.zipcode}
                    </p>
                    <p>{selectedAddress.country}</p>
                  </div>
                ) : (
                  <p className='text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200'>
                    Nenhuma morada selecionada. Por favor, adicione ou selecione
                    uma.
                  </p>
                )}

                {showAddress && user && (
                  <div className='mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white'>
                    {addresses.length > 0 ? (
                      addresses.map(address => (
                        <div
                          key={address._id}
                          onClick={() => {
                            setSelectedAddress(address);
                            setShowAddress(false);
                          }}
                          className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-primary-light/20 cursor-pointer text-sm text-gray-800 transition-colors duration-200 ${
                            selectedAddress?._id === address._id
                              ? 'bg-primary-light/30'
                              : ''
                          }`}
                        >
                          <p className='font-medium'>{address.street}</p>
                          <p>
                            {address.city}, {address.state}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className='p-3 text-gray-600 text-sm text-center'>
                        Nenhuma morada guardada.
                      </p>
                    )}
                    <div
                      onClick={() => {
                        if (requireLogin('adicionar uma nova morada')) {
                          navigate('/add-address');
                        }
                      }}
                      className='p-3 text-primary-dark hover:bg-primary-light/20 cursor-pointer text-center font-medium transition-colors duration-200 border-t border-gray-200'
                    >
                      + Adicionar Nova Morada
                    </div>
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className='mb-6 border-b pb-6 border-gray-200'>
                <h3 className='font-semibold text-gray-700 mb-3'>
                  Código Promocional
                </h3>
                <div className='flex w-full'>
                  <input
                    type='text'
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    placeholder='Introduza o código promocional'
                    disabled={discountApplied}
                    className='flex-1 min-w-0 border border-gray-300 rounded-l-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-700 disabled:bg-gray-100 placeholder:text-center sm:placeholder:text-left'
                  />
                  {discountApplied ? (
                    <button
                      onClick={handleRemovePromo}
                      className='bg-red-500 text-white px-5 py-2.5 rounded-r-lg hover:bg-red-600 transition-all duration-300 font-medium active:scale-95 flex-shrink-0'
                    >
                      Remover
                    </button>
                  ) : (
                    <button
                      onClick={handlePromoCode}
                      className='bg-primary text-white px-5 py-2.5 rounded-r-lg hover:bg-primary-dull transition-all duration-300 font-medium active:scale-95 flex-shrink-0'
                    >
                      Aplicar
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Method Selection - SIMPLIFIED */}
              <div className='mb-6 border-b pb-6 border-gray-200'>
                <h3 className='font-semibold text-gray-700 mb-3'>
                  Escolha o método de pagamento
                </h3>

                <div className='space-y-3'>
                  {/* Cartão de Crédito/Débito */}
                  <label 
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'card' 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type='radio'
                      name='paymentMethod'
                      value='card'
                      checked={paymentMethod === 'card'}
                      onChange={e => {
                        if (requireLogin('selecionar método de pagamento')) {
                          setPaymentMethod(e.target.value);
                        }
                      }}
                      className='sr-only'
                    />
                    <div className='flex items-center flex-1'>
                      <div className='w-10 h-10 flex items-center justify-center bg-indigo-100 rounded-lg mr-3'>
                        <svg className='w-6 h-6 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' />
                        </svg>
                      </div>
                      <div>
                        <span className='font-medium text-gray-800'>Cartão de Crédito/Débito</span>
                        <div className='flex gap-1 mt-1'>
                          <span className='text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium'>Visa</span>
                          <span className='text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium'>Mastercard</span>
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className='w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center'>
                        <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                        </svg>
                      </div>
                    )}
                  </label>

                  {/* MB Way */}
                  <label 
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'mbway' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type='radio'
                      name='paymentMethod'
                      value='mbway'
                      checked={paymentMethod === 'mbway'}
                      onChange={e => {
                        if (requireLogin('selecionar método de pagamento')) {
                          setPaymentMethod(e.target.value);
                        }
                      }}
                      className='sr-only'
                    />
                    <div className='flex items-center flex-1'>
                      <div className='w-10 h-10 flex items-center justify-center rounded-lg mr-3 overflow-hidden'>
                        <img 
                          src='/mbway.png' 
                          alt='MB Way' 
                          className='w-10 h-10 object-contain'
                        />
                      </div>
                      <div>
                        <span className='font-medium text-gray-800'>MB Way</span>
                        <p className='text-xs text-gray-500 mt-0.5'>Pagamento instantâneo via telemóvel</p>
                      </div>
                    </div>
                    {paymentMethod === 'mbway' && (
                      <div className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center'>
                        <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                        </svg>
                      </div>
                    )}
                  </label>

                  {/* Multibanco */}
                  <label 
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'multibanco' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type='radio'
                      name='paymentMethod'
                      value='multibanco'
                      checked={paymentMethod === 'multibanco'}
                      onChange={e => {
                        if (requireLogin('selecionar método de pagamento')) {
                          setPaymentMethod(e.target.value);
                        }
                      }}
                      className='sr-only'
                    />
                    <div className='flex items-center flex-1'>
                      <div className='w-10 h-10 flex items-center justify-center rounded-lg mr-3 overflow-hidden'>
                        <img 
                          src='/multibanco.png' 
                          alt='Multibanco' 
                          className='w-10 h-10 object-contain'
                        />
                      </div>
                      <div>
                        <span className='font-medium text-gray-800'>Multibanco</span>
                        <p className='text-xs text-gray-500 mt-0.5'>Referência para ATM ou homebanking</p>
                      </div>
                    </div>
                    {paymentMethod === 'multibanco' && (
                      <div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
                        <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                        </svg>
                      </div>
                    )}
                  </label>
                </div>

                {/* Mensagens Informativas */}
                {paymentMethod === 'card' && (
                  <div className='mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg'>
                    <p className='text-sm text-indigo-700'>
                      🔒 Pagamento seguro processado pela Stripe. Aceitamos Visa, Mastercard e outros cartões.
                    </p>
                  </div>
                )}

                {paymentMethod === 'mbway' && (
                  <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-sm text-red-700'>
                      📱 Receberá uma notificação no telemóvel para confirmar o pagamento via MB Way.
                    </p>
                  </div>
                )}

                {paymentMethod === 'multibanco' && (
                  <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                    <p className='text-sm text-blue-700'>
                      🏦 Será gerada uma referência Multibanco. Tem até 7 dias para efetuar o pagamento.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Total */}
              <div className='pt-4'>
                <div className='flex justify-between items-center mb-3 text-gray-700'>
                  <span>Subtotal ({getCartCount()} artigos):</span>
                  <span className='font-medium text-lg flex items-baseline'>
                    <span className='mr-0.5'>{currency}</span>
                    <span>{parseFloat(getCartAmount()).toFixed(2)}</span>
                  </span>
                </div>

                {discountApplied && (
                  <div className='flex justify-between items-center text-green-600 mb-3'>
                    <span>Desconto (30%):</span>
                    <span className='font-medium text-lg flex items-baseline'>
                      <span className='mr-0.5'>-{currency}</span>
                      <span>
                        {(parseFloat(getCartAmount()) * 0.3).toFixed(2)}
                      </span>
                    </span>
                  </div>
                )}
                <div className='flex justify-between font-bold text-xl mt-5 pt-3 border-t border-gray-200'>
                  <span>Total:</span>
                  <span className='text-primary-dark flex items-baseline'>
                    <span className='mr-0.5'>{currency}</span>
                    <span>{calculateTotal()}</span>
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={
                  isProcessing || !selectedAddress || cartArray.length === 0
                }
                className={`w-full mt-8 py-3.5 rounded-lg font-bold text-white text-lg shadow-md transition-all duration-300 active:scale-98 flex items-center justify-center gap-2
                  ${
                    isProcessing || !selectedAddress || cartArray.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : paymentMethod === 'mbway'
                      ? 'bg-red-600 hover:bg-red-700'
                      : paymentMethod === 'multibanco'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
              >
                {isProcessing ? (
                  <>
                    <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                        fill='none'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    <span>A Processar...</span>
                  </>
                ) : (
                  <>
                    {paymentMethod === 'mbway' && (
                      <img src='/mbway.png' alt='MB Way' className='w-6 h-6 object-contain' />
                    )}
                    {paymentMethod === 'multibanco' && (
                      <img src='/multibanco.png' alt='Multibanco' className='w-6 h-6 object-contain' />
                    )}
                    {paymentMethod === 'card' && (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                      </svg>
                    )}
                    <span>{getPaymentButtonText()}</span>
                  </>
                )}
              </button>

              {!isProcessing && (
                <div className='mt-3 text-center'>
                  <p className='text-xs text-gray-500'>
                    {paymentMethod === 'mbway'
                      ? 'Será redirecionado para introduzir o número de telemóvel'
                      : paymentMethod === 'multibanco'
                      ? 'Será gerada uma referência para pagamento'
                      : 'Pagamento seguro processado pela Stripe'}
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className='mt-6 pt-4 border-t border-gray-200'>
                <div className='flex items-center justify-center gap-4 text-xs text-gray-500'>
                  <div className='flex items-center gap-1'>
                    <svg className='w-4 h-4 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                    <span>Pagamento Seguro</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <svg className='w-4 h-4 text-blue-500' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z' />
                      <path fillRule='evenodd' d='M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z' clipRule='evenodd' />
                    </svg>
                    <span>Dados Protegidos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;