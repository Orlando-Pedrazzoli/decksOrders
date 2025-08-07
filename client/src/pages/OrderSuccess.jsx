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

  // ✅ Função para buscar detalhes do pedido
  // Apenas a parte que precisa ser corrigida no OrderSuccess.jsx

  // ✅ Função para buscar detalhes do pedido (corrigida)
  const fetchOrderDetails = async () => {
    if (!orderId || !user) return;

    try {
      // ✅ MUDANÇA: GET sem parâmetros (igual ao código que funciona)
      const { data } = await axios.get('/api/order/user');

      if (data.success) {
        const currentOrder = data.orders.find(order => order._id === orderId);
        setOrderDetails(currentOrder);
        console.log('📦 Detalhes do pedido carregados:', currentOrder);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes do pedido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Verificação de status para pagamentos Stripe
  const checkStripePaymentStatus = async () => {
    if (payment !== 'stripe' || !orderId) return;

    // Para pagamentos Stripe, aguardar um pouco para o webhook processar
    setTimeout(async () => {
      try {
        console.log('🔍 Verificando status do pagamento Stripe...');
        await fetchOrderDetails();
      } catch (error) {
        console.error('❌ Erro ao verificar status do pagamento:', error);
      }
    }, 3000); // 3 segundos para dar tempo do webhook processar
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

  const getPaymentMethodText = () => {
    if (payment === 'stripe' || orderDetails?.paymentType === 'Online') {
      return '💳 Pagamento Online (Stripe)';
    }
    return '💰 Pagamento na Entrega (COD)';
  };

  const getPaymentStatusBadge = () => {
    if (payment === 'stripe' || orderDetails?.paymentType === 'Online') {
      return (
        <div className='inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'>
          <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
          Pago ✅
        </div>
      );
    }
    return (
      <div className='inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium'>
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

  return (
    <div className='min-h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 py-8'>
      <div className='max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center'>
        {/* Success Icon */}
        <div className='mb-6'>
          <div className='mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4'>
            <svg
              className='w-12 h-12 text-green-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
            Encomenda Efetuada com Sucesso!
          </h1>
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
          <p className='text-gray-700 mb-4'>
            Muito obrigado pela sua compra! A sua encomenda foi processada com
            sucesso e está a ser preparada para envio.
          </p>

          {/* Order Details */}
          {orderId && (
            <div className='bg-gray-50 rounded-lg p-4 mb-6'>
              <div className='flex flex-col sm:flex-row justify-between items-center gap-3 mb-3'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>
                    Número da Encomenda:
                  </p>
                  <p className='text-lg font-mono font-semibold text-gray-800 break-all'>
                    #{orderId}
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

                {/* Order Value */}
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
                      <p className='text-sm text-green-600 font-medium'>
                        Desconto ({orderDetails.discountPercentage}%): -
                        {currency} {orderDetails.discountAmount.toFixed(2)}
                      </p>
                    )}
                    <p className='text-lg font-bold text-primary-dark'>
                      Total Pago: {currency} {orderDetails.amount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
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
