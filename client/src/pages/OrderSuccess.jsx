import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const payment = searchParams.get('payment'); // 'stripe' ou null para COD
  const { currency, user, axios } = useAppContext();

  const [countdown, setCountdown] = useState(8);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Função para buscar detalhes do pedido - ATUALIZADA PARA STRIPE
  const fetchOrderDetails = async () => {
    if (!orderId || !user) return;

    try {
      console.log('🔍 Buscando detalhes do pedido:', orderId);

      // ✅ USAR POST com userId para compatibilidade
      const { data } = await axios.post('/api/order/user', {
        userId: user._id,
      });

      if (data.success) {
        // Encontrar o pedido específico
        const currentOrder = data.orders.find(order => order._id === orderId);

        if (currentOrder) {
          // ✅ VERIFICAR SE É PEDIDO VÁLIDO PARA MOSTRAR
          const isValidOrder =
            currentOrder.paymentType === 'COD' ||
            (currentOrder.paymentType === 'Online' &&
              currentOrder.isPaid === true);

          if (isValidOrder) {
            setOrderDetails(currentOrder);
            console.log('✅ Detalhes do pedido carregados:', currentOrder);
          } else {
            console.log('⚠️ Pedido Stripe ainda não confirmado');
            setOrderDetails(null);
          }
        } else {
          console.log('❌ Pedido não encontrado');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes do pedido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Verificação de status para pagamentos Stripe - MELHORADA
  const checkStripePaymentStatus = async () => {
    if (payment !== 'stripe' || !orderId) return;

    console.log('💳 Verificando status do pagamento Stripe...');

    // Para pagamentos Stripe, aguardar webhook processar
    const checkPayment = async (attempt = 1, maxAttempts = 6) => {
      try {
        console.log(`🔍 Tentativa ${attempt} de verificar pagamento Stripe...`);

        const { data } = await axios.post('/api/order/user', {
          userId: user._id,
        });

        if (data.success) {
          const currentOrder = data.orders.find(order => order._id === orderId);

          if (currentOrder) {
            if (
              currentOrder.paymentType === 'Online' &&
              currentOrder.isPaid === true
            ) {
              console.log('✅ Pagamento Stripe confirmado!');
              setOrderDetails(currentOrder);
              return;
            } else if (attempt < maxAttempts) {
              // Tentar novamente após 3 segundos
              setTimeout(() => checkPayment(attempt + 1, maxAttempts), 3000);
            } else {
              console.log(
                '⚠️ Pagamento ainda não confirmado após múltiplas tentativas'
              );
            }
          }
        }
      } catch (error) {
        console.error(`❌ Erro na tentativa ${attempt}:`, error);
        if (attempt < maxAttempts) {
          setTimeout(() => checkPayment(attempt + 1, maxAttempts), 3000);
        }
      }
    };

    // Iniciar verificações após 2 segundos
    setTimeout(() => checkPayment(), 2000);
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Buscar detalhes do pedido
    fetchOrderDetails();

    // Verificar status se for pagamento Stripe
    checkStripePaymentStatus();

    // Redirect after countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/my-orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, orderId, payment, user]);

  // ✅ FUNÇÃO ATUALIZADA PARA STRIPE
  const getPaymentMethodText = () => {
    if (payment === 'stripe' || orderDetails?.paymentType === 'Online') {
      return '💳 Pagamento Online (Stripe)';
    }
    return '💰 Pagamento na Entrega (COD)';
  };

  // ✅ FUNÇÃO ATUALIZADA PARA STRIPE
  const getPaymentStatusBadge = () => {
    if (payment === 'stripe' || orderDetails?.paymentType === 'Online') {
      if (orderDetails?.isPaid) {
        return (
          <div className='inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'>
            <svg
              className='w-4 h-4 mr-1'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            Pagamento Confirmado ✅
          </div>
        );
      } else {
        return (
          <div className='inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium'>
            <svg
              className='w-4 h-4 mr-1'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                clipRule='evenodd'
              />
            </svg>
            Aguardando Confirmação
          </div>
        );
      }
    }
    return (
      <div className='inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
        <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
            clipRule='evenodd'
          />
        </svg>
        Pagamento na Entrega
      </div>
    );
  };

  // ✅ FUNÇÃO PARA MOSTRAR MENSAGEM BASEADA NO STATUS
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
            Olá{' '}
            <span className='font-semibold text-primary-dark'>
              {user?.name || 'Cliente'}
            </span>
            ,
          </p>

          {/* Mensagem específica por tipo de pagamento */}
          {payment === 'stripe' ? (
            orderDetails?.isPaid ? (
              <p className='text-gray-700 mb-4'>
                O seu pagamento foi processado com sucesso pela Stripe! A
                encomenda está confirmada e será preparada para envio.
              </p>
            ) : (
              <div className='bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4'>
                <p className='text-orange-800'>
                  A sua encomenda foi criada mas ainda aguardamos a confirmação
                  do pagamento. Isto pode demorar alguns minutos.
                </p>
              </div>
            )
          ) : (
            <p className='text-gray-700 mb-4'>
              Muito obrigado pela sua compra! A sua encomenda foi registada com
              sucesso e está a ser preparada.
            </p>
          )}

          {/* Order Details - ATUALIZADOS PARA STRIPE */}
          {orderId && (
            <div className='bg-gray-50 rounded-lg p-4 mb-6'>
              <div className='flex flex-col sm:flex-row justify-between items-center gap-3 mb-3'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>
                    Número da Encomenda:
                  </p>
                  <p className='text-lg font-mono font-semibold text-gray-800 break-all'>
                    #{orderId.slice(-8)}
                  </p>
                </div>
                {getPaymentStatusBadge()}
              </div>

              {/* Payment Method */}
              <div className='text-center p-3 bg-white rounded-lg border'>
                <p className='text-sm text-gray-600 mb-1'>
                  Método de Pagamento:
                </p>
                <p className='font-medium text-gray-800'>
                  {getPaymentMethodText()}
                </p>

                {/* Order Value - ATUALIZADO COM STRIPE LOGIC */}
                {orderDetails && (
                  <div className='mt-3 pt-3 border-t border-gray-200'>
                    {orderDetails.originalAmount &&
                      orderDetails.originalAmount !== orderDetails.amount && (
                        <p className='text-sm text-gray-500 line-through'>
                          Original: {currency}{' '}
                          {orderDetails.originalAmount.toFixed(2)}
                        </p>
                      )}
                    {orderDetails.discountAmount > 0 && (
                      <div className='space-y-1'>
                        <p className='text-sm text-green-600 font-medium'>
                          Código: <strong>{orderDetails.promoCode}</strong>
                        </p>
                        <p className='text-sm text-green-600 font-medium'>
                          Desconto ({orderDetails.discountPercentage}%): -
                          {currency} {orderDetails.discountAmount.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <p className='text-lg font-bold text-primary-dark'>
                      Total Pago: {currency} {orderDetails.amount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Stripe-specific info */}
              {payment === 'stripe' && (
                <div className='mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg'>
                  <div className='flex items-center justify-center mb-2'>
                    <svg
                      className='w-5 h-5 text-indigo-600 mr-2'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='text-sm font-medium text-indigo-800'>
                      Processado pela Stripe
                    </span>
                  </div>
                  <p className='text-xs text-indigo-700'>
                    Pagamento seguro processado através da plataforma Stripe
                  </p>
                </div>
              )}
            </div>
          )}

          <div className='bg-blue-50 rounded-lg p-6 mb-6'>
            <div className='flex items-center justify-center mb-3'>
              <svg
                className='w-8 h-8 text-blue-600 mr-2 flex-shrink-0'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
              </svg>
              <h3 className='text-lg font-semibold text-blue-800'>
                Email de Confirmação
              </h3>
            </div>
            <p className='text-blue-700 mb-2'>
              Um email com todos os detalhes da sua encomenda será enviado para{' '}
              <span className='font-semibold break-all'>
                {user?.email || 'o seu email'}
              </span>{' '}
              em breve.
            </p>
            <p className='text-sm text-blue-600'>
              Por favor, verifique também a pasta de spam/lixo eletrônico.
            </p>
          </div>

          {/* Countdown */}
          <div className='text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-lg'>
            <p className='mb-1'>Será redirecionado automaticamente para:</p>
            <p className='font-semibold'>
              <span className='text-primary-dark'>"As Minhas Encomendas"</span>{' '}
              em{' '}
              <span className='font-bold text-primary-dark text-lg'>
                {countdown}
              </span>{' '}
              segundo{countdown !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
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
              <svg
                className='w-5 h-5 mr-2 text-green-500 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <span className='font-medium'>Pagamento Seguro</span>
            </div>
            <div className='flex items-center justify-center p-3 bg-blue-50 rounded-lg'>
              <svg
                className='w-5 h-5 mr-2 text-blue-500 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
              </svg>
              <span className='font-medium'>Entrega Rápida</span>
            </div>
            <div className='flex items-center justify-center p-3 bg-purple-50 rounded-lg'>
              <svg
                className='w-5 h-5 mr-2 text-purple-500 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
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
              <a
                href='mailto:suporte@elitesurfing.pt'
                className='text-primary-dark hover:text-primary font-medium transition-colors duration-200'
              >
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
