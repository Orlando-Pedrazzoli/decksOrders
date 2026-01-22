import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { User, Lock, Eye, EyeOff, CheckCircle, Gift, Package, Bell } from 'lucide-react';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const payment = searchParams.get('payment');
  const isGuestParam = searchParams.get('guest');
  const { currency, user, axios, setUser, setAuthToken, saveUserToStorage } = useAppContext();

  const [countdown, setCountdown] = useState(15); // Aumentado para dar tempo de criar conta
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🆕 Estados para criação de conta
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');

  // Buscar detalhes do pedido
  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      console.log('🔍 Buscando detalhes do pedido:', orderId);

      // 🆕 Usar endpoint público para detalhes do pedido
      const { data } = await axios.get(`/api/order/details/${orderId}`);

      if (data.success && data.order) {
        setOrderDetails(data.order);
        console.log('✅ Detalhes do pedido carregados:', data.order);

        // 🆕 Se é guest order, preparar para criar conta
        if (data.order.isGuestOrder && data.order.guestEmail) {
          setGuestEmail(data.order.guestEmail);
          setShowCreateAccount(true);
        }
      } else if (data.pending) {
        console.log('⏳ Pedido ainda pendente, aguardando...');
        // Tentar novamente em alguns segundos
        setTimeout(fetchOrderDetails, 3000);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes do pedido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificação de status para pagamentos Stripe
  const checkStripePaymentStatus = async () => {
    if (payment !== 'stripe' || !orderId) return;

    console.log('💳 Verificando status do pagamento Stripe...');

    const checkPayment = async (attempt = 1, maxAttempts = 8) => {
      try {
        console.log(`🔍 Tentativa ${attempt} de verificar pagamento Stripe...`);

        const { data } = await axios.get(`/api/order/details/${orderId}`);

        if (data.success && data.order) {
          if (data.order.isPaid === true) {
            console.log('✅ Pagamento Stripe confirmado!');
            setOrderDetails(data.order);
            
            // 🆕 Se é guest order, preparar para criar conta
            if (data.order.isGuestOrder && data.order.guestEmail) {
              setGuestEmail(data.order.guestEmail);
              setShowCreateAccount(true);
            }
            return;
          } else if (attempt < maxAttempts) {
            setTimeout(() => checkPayment(attempt + 1, maxAttempts), 3000);
          } else {
            console.log('⚠️ Pagamento ainda não confirmado após múltiplas tentativas');
            setOrderDetails(data.order);
          }
        }
      } catch (error) {
        console.error(`❌ Erro na tentativa ${attempt}:`, error);
        if (attempt < maxAttempts) {
          setTimeout(() => checkPayment(attempt + 1, maxAttempts), 3000);
        }
      }
    };

    setTimeout(() => checkPayment(), 2000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    // 🆕 Verificar se é guest checkout pelo localStorage
    const storedGuestEmail = localStorage.getItem('guest_checkout_email');
    if (storedGuestEmail && !user) {
      setGuestEmail(storedGuestEmail);
      setShowCreateAccount(true);
    }

    fetchOrderDetails();
    checkStripePaymentStatus();

    // Redirect after countdown (apenas se não está a criar conta)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1 && !showCreateAccount) {
          navigate(user ? '/my-orders' : '/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, orderId, payment, user]);

  // 🆕 Parar countdown se está a criar conta
  useEffect(() => {
    if (showCreateAccount && !accountCreated) {
      setCountdown(999); // Pausar countdown
    }
  }, [showCreateAccount, accountCreated]);

  // =============================================================================
  // 🆕 CRIAR CONTA APÓS COMPRA
  // =============================================================================
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    
    if (!password) {
      return toast.error('Por favor, introduza uma password');
    }
    
    if (password.length < 6) {
      return toast.error('Password deve ter pelo menos 6 caracteres');
    }
    
    if (password !== confirmPassword) {
      return toast.error('As passwords não coincidem');
    }

    setIsCreatingAccount(true);

    try {
      const { data } = await axios.post('/api/user/convert-guest', {
        email: guestEmail,
        password: password,
        orderId: orderId,
        name: orderDetails?.guestName || guestEmail.split('@')[0],
      });

      if (data.success) {
        // 🎉 Conta criada com sucesso!
        toast.success('Conta criada com sucesso!');
        setAccountCreated(true);
        
        // Guardar autenticação
        if (data.token) {
          setAuthToken(data.token);
        }
        if (data.user) {
          setUser(data.user);
          saveUserToStorage(data.user);
        }
        
        // Limpar email de guest do localStorage
        localStorage.removeItem('guest_checkout_email');
        localStorage.removeItem('guest_checkout_address');
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          navigate('/my-orders');
        }, 3000);
        
      } else if (data.existingAccount) {
        toast.error('Já existe uma conta com este email. Por favor, faça login.');
        setShowCreateAccount(false);
      } else {
        toast.error(data.message || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('❌ Erro ao criar conta:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const getPaymentMethodText = () => {
    if (payment === 'stripe' || orderDetails?.paymentType === 'Online') {
      return '💳 Pagamento Online (Stripe)';
    }
    return '💰 Pagamento na Entrega (COD)';
  };

  const getPaymentStatusBadge = () => {
    if (payment === 'stripe' || orderDetails?.paymentType === 'Online') {
      if (orderDetails?.isPaid) {
        return (
          <div className='inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'>
            <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
            </svg>
            Pagamento Confirmado ✅
          </div>
        );
      } else {
        return (
          <div className='inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium'>
            <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
            </svg>
            Aguardando Confirmação
          </div>
        );
      }
    }
    return (
      <div className='inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
        <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
        </svg>
        Pagamento na Entrega
      </div>
    );
  };

  const getSuccessMessage = () => {
    if (payment === 'stripe') {
      if (orderDetails?.isPaid) {
        return {
          title: 'Pagamento Confirmado!',
          subtitle: 'O seu pagamento foi processado com sucesso.',
          icon: '✅',
        };
      } else {
        return {
          title: 'Encomenda Criada!',
          subtitle: 'A aguardar confirmação do pagamento...',
          icon: '⏳',
        };
      }
    } else {
      return {
        title: 'Encomenda Efetuada com Sucesso!',
        subtitle: 'A sua encomenda foi registada e está a ser processada.',
        icon: '🎉',
      };
    }
  };

  const successInfo = getSuccessMessage();
  const customerName = user?.name || orderDetails?.guestName || 'Cliente';
  const customerEmail = user?.email || orderDetails?.guestEmail || guestEmail;

  return (
    <div className='min-h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 py-8'>
      <div className='max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center'>
        {/* Success Icon */}
        <div className='mb-6'>
          <div className='mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4'>
            <div className='text-4xl'>{successInfo.icon}</div>
          </div>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
            {successInfo.title}
          </h1>
          <p className='text-lg text-gray-600 mb-4'>{successInfo.subtitle}</p>
          <div className='w-24 h-1 bg-green-500 mx-auto rounded-full'></div>
        </div>

        {/* Thank You Message */}
        <div className='mb-8'>
          <p className='text-lg text-gray-600 mb-4'>
            Olá <span className='font-semibold text-primary-dark'>{customerName}</span>,
          </p>

          {payment === 'stripe' ? (
            orderDetails?.isPaid ? (
              <p className='text-gray-700 mb-4'>
                O seu pagamento foi processado com sucesso! A encomenda está confirmada e será preparada para envio.
              </p>
            ) : (
              <div className='bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4'>
                <p className='text-orange-800'>
                  A sua encomenda foi criada mas ainda aguardamos a confirmação do pagamento. Isto pode demorar alguns minutos.
                </p>
              </div>
            )
          ) : (
            <p className='text-gray-700 mb-4'>
              Muito obrigado pela sua compra! A sua encomenda foi registada com sucesso e está a ser preparada.
            </p>
          )}

          {/* Order Details */}
          {orderId && (
            <div className='bg-gray-50 rounded-lg p-4 mb-6'>
              <div className='flex flex-col sm:flex-row justify-between items-center gap-3 mb-3'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Número da Encomenda:</p>
                  <p className='text-lg font-mono font-semibold text-gray-800 break-all'>
                    #{orderId.slice(-8)}
                  </p>
                </div>
                {getPaymentStatusBadge()}
              </div>

              {/* Payment Method */}
              <div className='text-center p-3 bg-white rounded-lg border'>
                <p className='text-sm text-gray-600 mb-1'>Método de Pagamento:</p>
                <p className='font-medium text-gray-800'>{getPaymentMethodText()}</p>

                {/* Order Value */}
                {orderDetails && (
                  <div className='mt-3 pt-3 border-t border-gray-200'>
                    {orderDetails.originalAmount && orderDetails.originalAmount !== orderDetails.amount && (
                      <p className='text-sm text-gray-500 line-through'>
                        Original: {currency} {orderDetails.originalAmount.toFixed(2)}
                      </p>
                    )}
                    {orderDetails.discountAmount > 0 && (
                      <div className='space-y-1'>
                        <p className='text-sm text-green-600 font-medium'>
                          Código: <strong>{orderDetails.promoCode}</strong>
                        </p>
                        <p className='text-sm text-green-600 font-medium'>
                          Desconto ({orderDetails.discountPercentage}%): -{currency} {orderDetails.discountAmount.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <p className='text-lg font-bold text-primary-dark'>
                      Total Pago: {currency} {orderDetails.amount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============================================================================
              🆕 CRIAR CONTA - SECÇÃO PARA GUESTS
          ============================================================================= */}
          {showCreateAccount && !user && !accountCreated && (
            <div className='bg-gradient-to-r from-primary/5 to-indigo-50 border-2 border-primary/20 rounded-xl p-6 mb-6'>
              <div className='flex items-center justify-center mb-4'>
                <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center'>
                  <Gift className='w-6 h-6 text-primary' />
                </div>
              </div>
              
              <h3 className='text-xl font-bold text-gray-800 mb-2'>
                Criar conta com 1 clique! 🚀
              </h3>
              
              <p className='text-gray-600 mb-4'>
                Só falta a password para aceder a:
              </p>
              
              {/* Benefícios */}
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6'>
                <div className='flex items-center justify-center gap-2 bg-white p-3 rounded-lg'>
                  <Package className='w-5 h-5 text-primary' />
                  <span className='text-sm font-medium'>Acompanhar Pedidos</span>
                </div>
                <div className='flex items-center justify-center gap-2 bg-white p-3 rounded-lg'>
                  <Bell className='w-5 h-5 text-primary' />
                  <span className='text-sm font-medium'>Atualizações</span>
                </div>
                <div className='flex items-center justify-center gap-2 bg-white p-3 rounded-lg'>
                  <CheckCircle className='w-5 h-5 text-primary' />
                  <span className='text-sm font-medium'>Checkout Rápido</span>
                </div>
              </div>
              
              {/* Formulário */}
              <form onSubmit={handleCreateAccount} className='space-y-4'>
                {/* Email (readonly) */}
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <User className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='email'
                    value={guestEmail}
                    disabled
                    className='w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600'
                  />
                </div>
                
                {/* Password */}
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Criar password'
                    className='w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary'
                    minLength={6}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5 text-gray-400' />
                    ) : (
                      <Eye className='h-5 w-5 text-gray-400' />
                    )}
                  </button>
                </div>
                
                {/* Confirm Password */}
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirmar password'
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary'
                    minLength={6}
                  />
                </div>
                
                <button
                  type='submit'
                  disabled={isCreatingAccount}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                    isCreatingAccount 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary-dull active:scale-[0.98]'
                  }`}
                >
                  {isCreatingAccount ? (
                    <>
                      <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                      </svg>
                      <span>A Criar Conta...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className='w-5 h-5' />
                      <span>Criar Conta</span>
                    </>
                  )}
                </button>
              </form>
              
              <button
                onClick={() => {
                  setShowCreateAccount(false);
                  localStorage.removeItem('guest_checkout_email');
                }}
                className='mt-3 text-sm text-gray-500 hover:text-gray-700'
              >
                Não, obrigado. Continuar sem conta.
              </button>
            </div>
          )}

          {/* 🎉 Conta Criada com Sucesso */}
          {accountCreated && (
            <div className='bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6'>
              <div className='flex items-center justify-center mb-4'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-10 h-10 text-green-600' />
                </div>
              </div>
              <h3 className='text-xl font-bold text-green-800 mb-2'>
                Conta Criada com Sucesso! 🎉
              </h3>
              <p className='text-green-700'>
                A redirecionar para os seus pedidos...
              </p>
            </div>
          )}

          {/* Email Confirmation */}
          <div className='bg-blue-50 rounded-lg p-6 mb-6'>
            <div className='flex items-center justify-center mb-3'>
              <svg className='w-8 h-8 text-blue-600 mr-2 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
              </svg>
              <h3 className='text-lg font-semibold text-blue-800'>Email de Confirmação</h3>
            </div>
            <p className='text-blue-700 mb-2'>
              Um email com todos os detalhes da sua encomenda será enviado para{' '}
              <span className='font-semibold break-all'>{customerEmail}</span> em breve.
            </p>
            <p className='text-sm text-blue-600'>
              Por favor, verifique também a pasta de spam/lixo eletrônico.
            </p>
          </div>

          {/* Countdown - só mostrar se não está a criar conta */}
          {(!showCreateAccount || accountCreated) && (
            <div className='text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-lg'>
              <p className='mb-1'>Será redirecionado automaticamente para:</p>
              <p className='font-semibold'>
                <span className='text-primary-dark'>
                  {user ? '"As Minhas Encomendas"' : 'Página Inicial'}
                </span>{' '}
                em{' '}
                <span className='font-bold text-primary-dark text-lg'>
                  {Math.min(countdown, 15)}
                </span>{' '}
                segundo{countdown !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          {user ? (
            <>
              <button
                onClick={() => navigate('/my-orders')}
                className='px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dull transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-base'
              >
                Ver as Minhas Encomendas
              </button>
              <button
                onClick={() => navigate('/write-review')}
                className='px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-base'
              >
                Escrever Review
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/')}
              className='px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dull transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-base'
            >
              Voltar à Página Inicial
            </button>
          )}
          <button
            onClick={() => navigate('/products')}
            className='px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 active:scale-95 text-base'
          >
            Continuar a Comprar
          </button>
        </div>

        {/* Additional Info */}
        <div className='pt-6 border-t border-gray-200'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
            <div className='flex items-center justify-center p-3 bg-green-50 rounded-lg'>
              <svg className='w-5 h-5 mr-2 text-green-500 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <span className='font-medium'>Pagamento Seguro</span>
            </div>
            <div className='flex items-center justify-center p-3 bg-blue-50 rounded-lg'>
              <svg className='w-5 h-5 mr-2 text-blue-500 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
              </svg>
              <span className='font-medium'>Entrega Rápida</span>
            </div>
            <div className='flex items-center justify-center p-3 bg-purple-50 rounded-lg'>
              <svg className='w-5 h-5 mr-2 text-purple-500 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
              </svg>
              <span className='font-medium'>Suporte 24/7</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
            <p className='text-sm text-gray-600 mb-2'>
              <span className='font-semibold'>Tem alguma questão?</span>
            </p>
            <p className='text-sm text-gray-600'>
              Contacte-nos:{' '}
              <a href='mailto:suporte@elitesurfing.pt' className='text-primary-dark hover:text-primary font-medium transition-colors duration-200'>
                suporte@elitesurfing.pt
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;