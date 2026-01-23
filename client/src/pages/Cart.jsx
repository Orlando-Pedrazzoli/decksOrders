import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';
import { SEO } from '../components/seo';
import seoConfig from '../components/seo/seoConfig';
import AddressFormModal from '../components/AddressFormModal';
import { MapPin, Plus, Edit3, ChevronDown, ChevronUp, Truck, Shield, CreditCard, User } from 'lucide-react';

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
    findProduct,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddressList, setShowAddressList] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stockWarnings, setStockWarnings] = useState({});
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [guestAddress, setGuestAddress] = useState(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  
  // Estado para morada de guest guardada no servidor
  const [guestAddressId, setGuestAddressId] = useState(null);

  // Estado para countdown de redirecionamento
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  
  const validPromoCode = 'BROTHER';

  // Verificar se carrinho está vazio
  const isCartEmpty = !products.length || !cartItems || Object.keys(cartItems).length === 0;

  // Redirecionamento automático quando carrinho está vazio
  useEffect(() => {
    if (isCartEmpty) {
      const timer = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Tentar voltar à página anterior, se não houver histórico vai para produtos
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/products');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      // Reset countdown se o carrinho deixar de estar vazio
      setRedirectCountdown(3);
    }
  }, [isCartEmpty, navigate]);

  // Carregar morada de guest do localStorage
  useEffect(() => {
    const savedGuestAddress = localStorage.getItem('guest_checkout_address');
    if (savedGuestAddress && !user) {
      setGuestAddress(JSON.parse(savedGuestAddress));
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (products.length > 0 && cartItems) {
      updateCartArray();
    }
    if (user) {
      loadUserAddresses();
    }
  }, [products, cartItems, user]);

  const updateCartArray = () => {
    const tempArray = Object.keys(cartItems)
      .map(key => {
        const product = findProduct(key);
        return product ? { ...product, quantity: cartItems[key] } : null;
      })
      .filter(Boolean);
    setCartArray(tempArray);

    const warnings = {};
    tempArray.forEach(product => {
      const availableStock = product.stock || 0;
      if (product.quantity > availableStock) {
        warnings[product._id] = `Apenas ${availableStock} disponível(eis)`;
      }
    });
    setStockWarnings(warnings);
  };

  const loadUserAddresses = async () => {
    try {
      const { data } = await axios.post('/api/address/get', {}, { withCredentials: true });
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          // Se tinha morada de guest guardada e fez login, usar essa como selecionada
          const savedGuestAddress = localStorage.getItem('guest_checkout_address');
          if (savedGuestAddress) {
            const guestAddr = JSON.parse(savedGuestAddress);
            // Verificar se já existe uma morada igual
            const existingMatch = data.addresses.find(a => 
              a.street === guestAddr.street && 
              a.zipcode === guestAddr.zipcode
            );
            if (existingMatch) {
              setSelectedAddress(existingMatch);
              localStorage.removeItem('guest_checkout_address');
            } else {
              // Guardar a morada de guest no servidor
              saveGuestAddressToServer(guestAddr);
            }
          } else {
            setSelectedAddress(prev => prev || data.addresses[0]);
          }
        } else if (guestAddress) {
          // User não tem moradas mas tinha guest address
          saveGuestAddressToServer(guestAddress);
        }
      }
    } catch (error) {
      console.error('Falha ao carregar as moradas:', error);
    }
  };

  // Guardar morada de guest no servidor após login
  const saveGuestAddressToServer = async (address) => {
    try {
      const { data } = await axios.post('/api/address/add', { address });
      if (data.success) {
        localStorage.removeItem('guest_checkout_address');
        setGuestAddress(null);
        loadUserAddresses();
        toast.success('Morada guardada na sua conta!');
      }
    } catch (error) {
      console.error('Erro ao guardar morada:', error);
    }
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(getCartAmount());
    let totalBeforeDiscount = subtotal;
    if (discountApplied) {
      const discount = subtotal * 0.3;
      totalBeforeDiscount -= discount;
    }
    return Math.max(0, totalBeforeDiscount).toFixed(2);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const product = findProduct(productId);
    if (!product) return;

    const availableStock = product.stock || 0;

    if (newQuantity > availableStock) {
      toast.error(`Apenas ${availableStock} unidade(s) disponível(eis) para ${product.name}`);
      if (availableStock > 0) {
        updateCartItem(productId, availableStock);
      }
      return;
    }

    updateCartItem(productId, newQuantity);
  };

  const validateStockBeforeCheckout = () => {
    const errors = [];
    
    for (const product of cartArray) {
      const availableStock = product.stock || 0;
      
      if (availableStock === 0) {
        errors.push(`${product.name} está esgotado`);
      } else if (product.quantity > availableStock) {
        errors.push(`${product.name}: apenas ${availableStock} disponível(eis)`);
      }
    }
    
    return errors;
  };

  // Obter morada atual (user ou guest)
  const getCurrentAddress = () => {
    if (user && selectedAddress) return selectedAddress;
    if (guestAddress) return guestAddress;
    return null;
  };

  // Verificar se tem morada
  const hasAddress = () => {
    return !!(user ? selectedAddress : guestAddress);
  };

  // =============================================================================
  // HANDLE PLACE ORDER - SUPORTA GUEST CHECKOUT COMPLETO
  // =============================================================================
  const handlePlaceOrder = async () => {
    const currentAddress = getCurrentAddress();
    
    if (!currentAddress) {
      return toast.error('Por favor, adicione uma morada de entrega.');
    }
    if (cartArray.length === 0) {
      return toast.error('O seu carrinho está vazio.');
    }

    const stockErrors = validateStockBeforeCheckout();
    if (stockErrors.length > 0) {
      toast.error('Stock insuficiente:\n' + stockErrors.join('\n'));
      return;
    }

    setIsProcessing(true);
    
    try {
      const subtotal = parseFloat(getCartAmount());
      const discountAmount = discountApplied ? subtotal * 0.3 : 0;
      const finalAmount = subtotal - discountAmount;

      // Preparar dados base do pedido
      const orderData = {
        items: cartArray.map(item => ({
          product: item._id,
          quantity: item.quantity,
        })),
        originalAmount: subtotal,
        amount: finalAmount,
        discountAmount: discountAmount,
        discountPercentage: discountApplied ? 30 : 0,
        promoCode: discountApplied ? promoCode.toUpperCase() : '',
        paymentType: 'Online',
        paymentMethod: paymentMethod,
        isPaid: false,
      };

      let endpoint;
      let addressId;

      if (user) {
        // ========== USER AUTENTICADO ==========
        orderData.userId = user._id;
        orderData.address = selectedAddress._id;
        orderData.isGuestOrder = false;
        endpoint = '/api/order/stripe';
        
      } else {
        // ========== GUEST CHECKOUT ==========
        // Primeiro, criar/guardar a morada temporariamente
        const addressResponse = await axios.post('/api/address/guest', { 
          address: currentAddress 
        });
        
        if (!addressResponse.data.success) {
          throw new Error(addressResponse.data.message || 'Erro ao guardar morada');
        }
        
        addressId = addressResponse.data.addressId;
        
        orderData.isGuestOrder = true;
        orderData.guestEmail = currentAddress.email;
        orderData.guestName = `${currentAddress.firstName} ${currentAddress.lastName}`;
        orderData.guestPhone = currentAddress.phone;
        orderData.address = addressId;
        endpoint = '/api/order/guest/stripe';
      }

      const response = await axios.post(endpoint, orderData);

      if (response.data.success && response.data.url) {
        // Limpar carrinho local
        const emptyCart = {};
        setCartItems(emptyCart);
        saveCartToStorage(emptyCart);
        
        // Guardar email de guest para página de sucesso
        if (!user && currentAddress.email) {
          localStorage.setItem('guest_checkout_email', currentAddress.email);
        }
        
        // Redirecionar para Stripe
        window.location.replace(response.data.url);
      } else {
        toast.error(response.data.message || 'Falha ao inicializar o pagamento.');
      }
    } catch (error) {
      console.error('Erro na encomenda:', error);
      
      if (error.response?.status === 401 && user) {
        toast.error('Sessão expirada. Por favor, inicie sessão novamente.');
        if (isMobile) localStorage.removeItem('mobile_auth_token');
        setShowUserLogin(true);
      } else {
        toast.error(error.response?.data?.message || 'Falha ao processar a encomenda.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromoCode = () => {
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

  const getPaymentButtonText = () => {
    if (isProcessing) return 'A Processar...';
    
    switch (paymentMethod) {
      case 'mbway': return 'Pagar com MB Way';
      case 'multibanco': return 'Gerar Referência Multibanco';
      default: return 'Pagar com Cartão';
    }
  };

  // Handler para guardar morada
  const handleSaveAddress = async (addressData) => {
    setIsAddressLoading(true);
    
    try {
      if (user) {
        // User logado - guardar no servidor
        if (editingAddress) {
          const { data } = await axios.put(`/api/address/update/${editingAddress._id}`, { address: addressData });
          if (data.success) {
            toast.success('Morada atualizada!');
            loadUserAddresses();
          }
        } else {
          const { data } = await axios.post('/api/address/add', { address: addressData });
          if (data.success) {
            toast.success('Morada adicionada!');
            loadUserAddresses();
          }
        }
      } else {
        // Guest - guardar no localStorage
        setGuestAddress(addressData);
        localStorage.setItem('guest_checkout_address', JSON.stringify(addressData));
        toast.success('Morada adicionada!');
      }
      
      setShowAddressModal(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Erro ao guardar morada:', error);
      toast.error('Erro ao guardar morada. Tente novamente.');
    } finally {
      setIsAddressLoading(false);
    }
  };

  // Abrir modal para adicionar morada
  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  // Abrir modal para editar morada
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressModal(true);
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

  // Componente para renderizar bolinha de cor
  const ColorBall = ({ code1, code2, size = 24, title }) => {
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

  // Empty cart com redirecionamento automático
  if (isCartEmpty) {
    return (
      <>
        <SEO title={seoConfig.cart.title} description={seoConfig.cart.description} url={seoConfig.cart.url} noindex={true} />
        <div className='flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-gray-50'>
          <img src={assets.empty_cart} alt='Carrinho vazio' className='w-56 sm:w-64 md:w-72 mb-6 max-w-full' />
          <h3 className='text-xl sm:text-2xl font-semibold mb-3 text-gray-700'>O seu carrinho está vazio!</h3>
          <p className='text-gray-600 mb-4 max-w-md'>Ainda não adicionou produtos ao carrinho.</p>
          
          {/* Countdown indicator */}
          <div className='mb-6 flex items-center gap-2 text-gray-500'>
            <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
            </svg>
            <span className='text-sm'>A redirecionar em {redirectCountdown}s...</span>
          </div>

          <button onClick={() => navigate('/products')} className='bg-primary text-white px-7 py-3 rounded-lg shadow-md hover:bg-primary-dull transition-all duration-300 text-base font-medium active:scale-95'>
            Explorar produtos agora
          </button>
        </div>
      </>
    );
  }

  const currentAddress = getCurrentAddress();

  return (
    <>
      <SEO title={seoConfig.cart.title} description={seoConfig.cart.description} url={seoConfig.cart.url} noindex={true} />

      {/* Modal de Morada */}
      <AddressFormModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        initialAddress={editingAddress || (user?.email ? { email: user.email } : null)}
        isGuest={!user}
        isLoading={isAddressLoading}
      />

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-[calc(100vh-60px)]'>
        {/* Progress Steps */}
        <div className='max-w-2xl mx-auto mb-8'>
          <div className='flex items-center justify-center'>
            <div className='flex items-center'>
              <div className='flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold'>
                1
              </div>
              <span className='ml-2 text-sm font-medium text-primary'>Carrinho</span>
            </div>
            <div className={`w-16 h-1 mx-3 rounded ${hasAddress() ? 'bg-primary' : 'bg-gray-300'}`}></div>
            <div className='flex items-center'>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                hasAddress() ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500'
              }`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${hasAddress() ? 'text-primary' : 'text-gray-500'}`}>
                Morada
              </span>
            </div>
            <div className={`w-16 h-1 mx-3 rounded ${hasAddress() ? 'bg-primary' : 'bg-gray-300'}`}></div>
            <div className='flex items-center'>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                hasAddress() ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500'
              }`}>
                3
              </div>
              <span className={`ml-2 text-sm font-medium ${hasAddress() ? 'text-primary' : 'text-gray-500'}`}>
                Pagamento
              </span>
            </div>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Cart Items Section */}
          <div className='lg:w-2/3'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6'>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0'>
                Carrinho de Compras ({getCartCount()} artigos)
              </h1>
              <button onClick={() => navigate('/products')} className='flex items-center text-primary-dark hover:underline text-sm sm:text-base font-medium'>
                Continuar a Comprar
                <img src={assets.arrow_right_icon_colored} alt='>' className='ml-1 h-4 w-4' />
              </button>
            </div>

            <div className='bg-white rounded-xl shadow-lg overflow-hidden divide-y divide-gray-200'>
              {cartArray.map(product => {
                const availableStock = product.stock || 0;
                const hasStockWarning = stockWarnings[product._id];
                const isLowStock = availableStock > 0 && availableStock <= 3;

                return (
                  <div key={product._id} className={`flex flex-col sm:flex-row items-center p-4 sm:p-6 ${hasStockWarning ? 'bg-red-50' : ''}`}>
                    <div className='flex items-center w-full sm:w-2/3 mb-4 sm:mb-0'>
                      <div className='relative'>
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className='w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-transform duration-200 hover:scale-[1.02]'
                          onClick={() => navigate(`/products/${product.category.toLowerCase()}/${product._id}`)}
                        />
                        {product.colorCode && (
                          <ColorBall
                            code1={product.colorCode}
                            code2={product.colorCode2}
                            size={24}
                            title={product.color || 'Cor'}
                          />
                        )}
                      </div>
                      
                      <div className='ml-4 flex-grow'>
                        <h3 className='font-semibold text-lg text-gray-800'>{product.name}</h3>
                        
                        {product.color && (
                          <p className='text-sm text-gray-500 mt-0.5'>Cor: {product.color}</p>
                        )}
                        
                        <p className='text-sm text-gray-500 mt-1'>Peso: {product.weight || 'N/A'}</p>
                        
                        {isLowStock && !hasStockWarning && (
                          <p className='text-xs text-orange-600 font-medium mt-1'>Últimas {availableStock} unidades!</p>
                        )}
                        
                        {hasStockWarning && (
                          <p className='text-xs text-red-600 font-medium mt-1 bg-red-100 px-2 py-1 rounded'>
                            {hasStockWarning}
                          </p>
                        )}
                        
                        <p className='font-medium text-gray-700 mt-2 text-base sm:hidden'>
                          {currency} {(product.offerPrice * product.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className='flex justify-between items-center w-full sm:w-1/3 sm:justify-end sm:gap-8'>
                      <div className='flex items-center'>
                        <span className='mr-2 text-gray-600'>Qtd:</span>
                        <select
                          value={cartItems[product._id]}
                          onChange={e => handleQuantityChange(product._id, Number(e.target.value))}
                          className={`border rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none cursor-pointer ${
                            hasStockWarning ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          {[...Array(Math.max(availableStock, product.quantity, 1)).keys()].map(num => (
                            <option 
                              key={num + 1} 
                              value={num + 1}
                              disabled={num + 1 > availableStock}
                            >
                              {num + 1}{num + 1 > availableStock ? ' (indisponível)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className='text-right hidden sm:block'>
                        <p className='font-bold text-lg text-gray-800 flex items-baseline justify-end'>
                          <span className='mr-0.5'>{currency}</span>
                          <span>{(product.offerPrice * product.quantity).toFixed(2)}</span>
                        </p>
                      </div>
                      <button onClick={() => removeFromCart(product._id)} className='text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200 ml-4 cursor-pointer'>
                        Remover
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.keys(stockWarnings).length > 0 && (
              <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                <p className='text-red-700 font-medium'>Alguns produtos excedem o stock disponível. Por favor, ajuste as quantidades antes de finalizar.</p>
              </div>
            )}
          </div>

          {/* Checkout Section */}
          <div className='lg:w-1/3'>
            <div className='bg-white rounded-xl shadow-lg p-6 sticky lg:top-8'>
              <h2 className='text-2xl font-bold mb-5 text-gray-800'>Finalizar Compra</h2>

              {/* Guest Checkout Banner */}
              {!user && (
                <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                  <div className='flex items-center gap-2 text-green-800'>
                    <Shield className='w-5 h-5' />
                    <span className='font-medium text-sm'>Compre sem criar conta!</span>
                  </div>
                  <p className='text-xs text-green-700 mt-1'>
                    Complete a compra rapidamente. Pode criar conta depois.
                  </p>
                </div>
              )}

              {/* Address Section */}
              <div className='mb-6 border-b pb-6 border-gray-200'>
                <div className='flex items-center gap-2 mb-4'>
                  <MapPin className='w-5 h-5 text-primary' />
                  <h3 className='font-semibold text-gray-700'>Morada de Entrega</h3>
                </div>

                {currentAddress ? (
                  <div className='space-y-3'>
                    <div className='bg-primary/5 border-2 border-primary/20 p-4 rounded-xl'>
                      <div className='flex justify-between items-start'>
                        <div className='text-sm text-gray-700'>
                          <p className='font-semibold text-gray-800'>
                            {currentAddress.firstName} {currentAddress.lastName}
                          </p>
                          <p className='mt-1'>{currentAddress.street}</p>
                          <p>{currentAddress.city}, {currentAddress.state} {currentAddress.zipcode}</p>
                          <p>{currentAddress.country}</p>
                          <p className='mt-1 text-gray-500'>{currentAddress.phone}</p>
                          {!user && currentAddress.email && (
                            <p className='mt-1 text-primary font-medium'>{currentAddress.email}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleEditAddress(currentAddress)}
                          className='p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors'
                          title='Editar morada'
                        >
                          <Edit3 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>

                    {/* Lista de moradas alternativas (apenas para users logados) */}
                    {user && addresses.length > 1 && (
                      <div>
                        <button
                          onClick={() => setShowAddressList(!showAddressList)}
                          className='w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors'
                        >
                          <span>Escolher outra morada ({addresses.length})</span>
                          {showAddressList ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
                        </button>
                        
                        {showAddressList && (
                          <div className='mt-2 border border-gray-200 rounded-lg overflow-hidden'>
                            {addresses.map(address => (
                              <div
                                key={address._id}
                                onClick={() => {
                                  setSelectedAddress(address);
                                  setShowAddressList(false);
                                }}
                                className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer text-sm transition-colors ${
                                  selectedAddress?._id === address._id ? 'bg-primary/5' : ''
                                }`}
                              >
                                <p className='font-medium'>{address.firstName} {address.lastName}</p>
                                <p className='text-gray-600'>{address.street}</p>
                                <p className='text-gray-500'>{address.city}, {address.state}</p>
                              </div>
                            ))}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddAddress();
                                setShowAddressList(false);
                              }}
                              className='w-full p-3 text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 font-medium'
                            >
                              <Plus className='w-4 h-4' />
                              Nova morada
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='text-center py-4'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                      <MapPin className='w-8 h-8 text-gray-400' />
                    </div>
                    <p className='text-gray-600 mb-4'>
                      {user 
                        ? 'Adicione uma morada para continuar'
                        : 'Adicione os seus dados de entrega'
                      }
                    </p>
                    <button
                      onClick={handleAddAddress}
                      className='w-full py-3 px-4 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2'
                    >
                      <Plus className='w-5 h-5' />
                      Adicionar Morada
                    </button>
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className='mb-6 border-b pb-6 border-gray-200'>
                <h3 className='font-semibold text-gray-700 mb-3'>Código Promocional</h3>
                <div className='flex w-full'>
                  <input 
                    type='text' 
                    value={promoCode} 
                    onChange={e => setPromoCode(e.target.value)} 
                    placeholder='Introduza o código' 
                    disabled={discountApplied} 
                    className='flex-1 min-w-0 border border-gray-300 rounded-l-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-700 disabled:bg-gray-100' 
                  />
                  {discountApplied ? (
                    <button onClick={handleRemovePromo} className='bg-red-500 text-white px-5 py-2.5 rounded-r-lg hover:bg-red-600 transition-all duration-300 font-medium active:scale-95 flex-shrink-0'>
                      Remover
                    </button>
                  ) : (
                    <button onClick={handlePromoCode} className='bg-primary text-white px-5 py-2.5 rounded-r-lg hover:bg-primary-dull transition-all duration-300 font-medium active:scale-95 flex-shrink-0'>
                      Aplicar
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Method Selection - Mostrar sempre que tem morada */}
              {hasAddress() && (
                <div className='mb-6 border-b pb-6 border-gray-200'>
                  <h3 className='font-semibold text-gray-700 mb-3'>Método de Pagamento</h3>
                  <div className='space-y-3'>
                    {/* Card */}
                    <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                      <input type='radio' name='paymentMethod' value='card' checked={paymentMethod === 'card'} onChange={e => setPaymentMethod(e.target.value)} className='sr-only' />
                      <div className='flex items-center flex-1'>
                        <div className='w-10 h-10 flex items-center justify-center bg-indigo-100 rounded-lg mr-3'>
                          <CreditCard className='w-5 h-5 text-indigo-600' />
                        </div>
                        <div>
                          <span className='font-medium text-gray-800'>Cartão</span>
                          <div className='flex gap-1 mt-0.5'>
                            <span className='text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded'>Visa</span>
                            <span className='text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded'>MC</span>
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
                    <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${paymentMethod === 'mbway' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                      <input type='radio' name='paymentMethod' value='mbway' checked={paymentMethod === 'mbway'} onChange={e => setPaymentMethod(e.target.value)} className='sr-only' />
                      <div className='flex items-center flex-1'>
                        <div className='w-10 h-10 flex items-center justify-center rounded-lg mr-3 overflow-hidden'>
                          <img src='/mbway.png' alt='MB Way' className='w-10 h-10 object-contain' />
                        </div>
                        <div>
                          <span className='font-medium text-gray-800'>MB Way</span>
                          <p className='text-xs text-gray-500'>Pagamento instantâneo</p>
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
                    <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${paymentMethod === 'multibanco' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                      <input type='radio' name='paymentMethod' value='multibanco' checked={paymentMethod === 'multibanco'} onChange={e => setPaymentMethod(e.target.value)} className='sr-only' />
                      <div className='flex items-center flex-1'>
                        <div className='w-10 h-10 flex items-center justify-center rounded-lg mr-3 overflow-hidden'>
                          <img src='/multibanco.png' alt='Multibanco' className='w-10 h-10 object-contain' />
                        </div>
                        <div>
                          <span className='font-medium text-gray-800'>Multibanco</span>
                          <p className='text-xs text-gray-500'>Referência (7 dias)</p>
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
                </div>
              )}

              {/* Order Total */}
              <div className='pt-4'>
                <div className='flex justify-between items-center mb-3 text-gray-700'>
                  <span>Subtotal ({getCartCount()} artigos):</span>
                  <span className='font-medium text-lg'>
                    {currency} {parseFloat(getCartAmount()).toFixed(2)}
                  </span>
                </div>
                {discountApplied && (
                  <div className='flex justify-between items-center text-green-600 mb-3'>
                    <span>Desconto (30%):</span>
                    <span className='font-medium text-lg'>
                      -{currency} {(parseFloat(getCartAmount()) * 0.3).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className='flex justify-between font-bold text-xl mt-5 pt-3 border-t border-gray-200'>
                  <span>Total:</span>
                  <span className='text-primary-dark'>
                    {currency} {calculateTotal()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !hasAddress() || cartArray.length === 0 || Object.keys(stockWarnings).length > 0}
                className={`w-full mt-8 py-3.5 rounded-xl font-bold text-white text-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2
                  ${isProcessing || !hasAddress() || cartArray.length === 0 || Object.keys(stockWarnings).length > 0
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
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                    </svg>
                    <span>A Processar...</span>
                  </>
                ) : !hasAddress() ? (
                  <span>Adicione uma morada</span>
                ) : (
                  <>
                    {paymentMethod === 'mbway' && <img src='/mbway.png' alt='MB Way' className='w-6 h-6 object-contain' />}
                    {paymentMethod === 'multibanco' && <img src='/multibanco.png' alt='Multibanco' className='w-6 h-6 object-contain' />}
                    {paymentMethod === 'card' && <CreditCard className='w-5 h-5' />}
                    <span>{getPaymentButtonText()}</span>
                  </>
                )}
              </button>

              {/* Login prompt para guests */}
              {!user && hasAddress() && (
                <div className='mt-4 text-center'>
                  <p className='text-sm text-gray-500 mb-2'>Já tem conta?</p>
                  <button
                    onClick={() => setShowUserLogin(true)}
                    className='text-primary font-medium hover:underline flex items-center justify-center gap-1 mx-auto'
                  >
                    <User className='w-4 h-4' />
                    Iniciar sessão
                  </button>
                </div>
              )}

              {/* Trust Badges */}
              <div className='mt-6 pt-4 border-t border-gray-200'>
                <div className='flex items-center justify-center gap-4 text-xs text-gray-500'>
                  <div className='flex items-center gap-1'>
                    <Shield className='w-4 h-4 text-green-500' />
                    <span>Pagamento Seguro</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Truck className='w-4 h-4 text-blue-500' />
                    <span>Entrega Rápida</span>
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