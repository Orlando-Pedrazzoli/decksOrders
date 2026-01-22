import React, { useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { SEO } from '../components/seo';
import seoConfig from '../components/seo/seoConfig';
import { Loader2 } from 'lucide-react';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // ✅ NOVO: loading state
  const [error, setError] = useState(null); // ✅ NOVO: error state
  const { currency, axios, user } = useAppContext();

  // ✅ CORRIGIDO: useCallback para evitar re-criação da função
  const fetchMyOrders = useCallback(async () => {
    // ✅ Verificar se user existe e tem _id
    if (!user?._id) {
      console.log('❌ User não disponível ainda');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Buscando pedidos para usuário:', user._id);

      const { data } = await axios.post('/api/order/user', {
        userId: user._id,
      });

      console.log('📋 Resposta do servidor:', data);

      if (data.success) {
        console.log('📋 Pedidos carregados:', data.orders.length);

        // ✅ FILTRAR PEDIDOS: COD (sempre) + Online (só se pagos)
        const validOrders = data.orders.filter(order => {
          if (order.paymentType === 'COD') {
            return true;
          }
          if (order.paymentType === 'Online') {
            return order.isPaid === true;
          }
          return false;
        });

        console.log('✅ Pedidos válidos (filtrados):', validOrders.length);
        setMyOrders(validOrders);
      } else {
        console.error('❌ Erro ao buscar pedidos:', data.message);
        setError(data.message || 'Erro ao carregar pedidos');
      }
    } catch (error) {
      console.error('❌ Erro na requisição de pedidos:', error);
      console.error('❌ Status do erro:', error.response?.status);
      console.error('❌ Dados do erro:', error.response?.data);
      
      // ✅ NOVO: Tratamento específico para erro de autenticação
      if (error.response?.status === 401) {
        setError('Sessão expirada. Por favor, faça login novamente.');
      } else {
        setError(error.response?.data?.message || 'Erro ao carregar pedidos');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, axios]);

  // ✅ CORRIGIDO: Dependência correta e delay para garantir token configurado
  useEffect(() => {
    if (user?._id) {
      console.log('👤 Usuário encontrado, buscando pedidos...');
      // Pequeno delay para garantir que o token está configurado nos headers
      const timer = setTimeout(() => {
        fetchMyOrders();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      console.log('❌ Usuário não encontrado');
      setMyOrders([]);
      setIsLoading(false);
    }
  }, [user?._id, fetchMyOrders]);

  // ✅ FUNÇÃO PARA MOSTRAR STATUS DE PAGAMENTO
  const getPaymentStatusBadge = order => {
    if (order.paymentType === 'Online') {
      if (order.isPaid) {
        return (
          <span className='inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'>
            <svg
              className='w-3 h-3 mr-1'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            Pago
          </span>
        );
      } else {
        return (
          <span className='inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium'>
            <svg
              className='w-3 h-3 mr-1'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                clipRule='evenodd'
              />
            </svg>
            Pendente
          </span>
        );
      }
    } else {
      return (
        <span className='inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'>
          💰 COD
        </span>
      );
    }
  };

  // ✅ FUNÇÃO PARA CALCULAR VALOR TOTAL EXIBIDO
  const getDisplayAmount = order => {
    if (order.amount) {
      return order.amount.toFixed(2);
    }

    let total = 0;
    order.items.forEach(item => {
      if (item.product && item.product.offerPrice) {
        total += item.product.offerPrice * item.quantity;
      }
    });

    total += Math.floor(total * 0.02);

    if (order.discountAmount > 0) {
      total -= order.discountAmount;
    }

    return Math.max(0, total).toFixed(2);
  };

  // 🆕 Helper: verificar se cor é clara
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

  // 🆕 Componente para renderizar bolinha de cor
  const ColorBall = ({ code1, code2, size = 22, title }) => {
    if (!code1) return null;
    
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
            style={{ backgroundColor: code1 }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <SEO 
        title={seoConfig.myOrders.title}
        description={seoConfig.myOrders.description}
        url={seoConfig.myOrders.url}
        noindex={true}
      />

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-60px)] bg-gray-50'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center'>
            As Minhas Encomendas
          </h1>

          {/* ✅ NOVO: Loading State */}
          {isLoading ? (
            <div className='flex flex-col items-center justify-center min-h-[50vh] text-center'>
              <Loader2 className='w-12 h-12 text-primary animate-spin mb-4' />
              <p className='text-gray-600'>A carregar as suas encomendas...</p>
            </div>
          ) : error ? (
            /* ✅ NOVO: Error State */
            <div className='flex flex-col items-center justify-center min-h-[50vh] text-center'>
              <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                <svg className='w-10 h-10 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <p className='text-xl font-semibold mb-3 text-gray-700'>
                Ocorreu um erro
              </p>
              <p className='text-gray-600 mb-4'>{error}</p>
              <button
                onClick={fetchMyOrders}
                className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition-colors'
              >
                Tentar novamente
              </button>
            </div>
          ) : myOrders.length === 0 ? (
            <div className='flex flex-col items-center justify-center min-h-[50vh] text-center'>
              <img
                src={assets.empty_cart}
                alt='Sem encomendas'
                className='w-48 sm:w-56 md:w-64 mb-6 opacity-75'
              />
              <p className='text-xl sm:text-2xl font-semibold mb-3 text-gray-700'>
                Ainda não existem encomendas!
              </p>
              <p className='text-gray-600 max-w-md'>
                Parece que ainda não efetuou nenhuma encomenda. Comece já a
                comprar!
              </p>
            </div>
          ) : (
            <div className='space-y-8'>
              {myOrders.map((order, orderIndex) => (
                <div
                  key={order._id || orderIndex}
                  className='bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200'
                >
                  {/* Order Header */}
                  <div className='bg-primary-light/30 p-4 sm:p-5 border-b border-gray-200'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3'>
                      <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-0'>
                        Encomenda ID: #{order._id?.slice(-8) || 'N/A'}
                      </h3>
                      <div className='flex flex-col sm:items-end gap-2'>
                        <p className='text-sm sm:text-base text-gray-700'>
                          Data:{' '}
                          {new Date(order.createdAt).toLocaleDateString('pt-PT')}
                        </p>
                        {getPaymentStatusBadge(order)}
                      </div>
                    </div>

                    {/* Payment Method Info */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3'>
                      <div>
                        <p className='text-sm text-gray-600'>
                          Método de Pagamento:
                        </p>
                        <p className='font-semibold text-gray-800'>
                          {order.paymentType === 'COD'
                            ? '💰 Pagamento na Entrega'
                            : '💳 Pagamento Online (Stripe)'}
                        </p>
                      </div>

                      <div className='text-left sm:text-right'>
                        <p className='text-sm text-gray-600'>Total:</p>
                        <div>
                          {order.originalAmount &&
                            order.originalAmount !== order.amount && (
                              <p className='text-sm text-gray-500 line-through'>
                                Original: {currency}{' '}
                                {order.originalAmount.toFixed(2)}
                              </p>
                            )}
                          {order.discountAmount > 0 && (
                            <p className='text-sm text-green-600 font-medium'>
                              Desconto ({order.discountPercentage}%): -{currency}{' '}
                              {order.discountAmount.toFixed(2)}
                            </p>
                          )}
                          <p className='font-bold text-lg text-primary-dark'>
                            {currency} {getDisplayAmount(order)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Promo Code Info */}
                    {order.promoCode && (
                      <div className='flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-lg border border-green-200'>
                        <svg
                          className='w-4 h-4 text-green-600'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v4a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z'
                            clipRule='evenodd'
                          />
                        </svg>
                        <span className='text-sm font-medium text-green-800'>
                          Código promocional aplicado:{' '}
                          <strong>{order.promoCode}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items in the Order */}
                  <div className='divide-y divide-gray-100'>
                    {order.items
                      .filter(item => item?.product)
                      .map((item, itemIndex) => (
                        <div
                          key={item?.product?._id || itemIndex}
                          className='flex flex-col sm:flex-row items-center p-4 sm:p-5 gap-4'
                        >
                          {/* Product Image com bolinha de cor */}
                          <div className='relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-lg overflow-hidden border border-gray-200'>
                            <img
                              src={
                                item?.product?.image?.[0] ||
                                assets.placeholder_image
                              }
                              alt={item?.product?.name || 'Imagem do Produto'}
                              className='w-full h-full object-contain'
                            />
                            <ColorBall
                              code1={item?.product?.colorCode}
                              code2={item?.product?.colorCode2}
                              size={22}
                              title={item?.product?.color || 'Cor'}
                            />
                          </div>

                          {/* Product Details */}
                          <div className='flex-grow text-center sm:text-left'>
                            <h2 className='text-lg sm:text-xl font-bold text-gray-800 mb-1'>
                              {item?.product?.name || 'Produto Indisponível'}
                            </h2>
                            <p className='text-sm text-gray-600'>
                              Categoria: {item?.product?.category || 'N/D'}
                            </p>
                            
                            {item?.product?.color && (
                              <p className='text-sm text-gray-600'>
                                Cor: {item.product.color}
                              </p>
                            )}
                            
                            <div className='flex flex-col sm:flex-row gap-2 mt-2'>
                              <p className='text-sm text-gray-600'>
                                Quantidade:{' '}
                                <span className='font-semibold'>
                                  {item.quantity || '1'}
                                </span>
                              </p>
                              <p className='text-sm text-gray-600'>
                                Preço unitário:{' '}
                                <span className='font-semibold'>
                                  {currency}{' '}
                                  {item?.product?.offerPrice?.toFixed(2) ||
                                    '0.00'}
                                </span>
                              </p>
                            </div>
                            <p className='text-primary-dark font-bold text-lg sm:text-xl flex items-baseline justify-center sm:justify-start mt-2'>
                              <span className='mr-0.5'>{currency}</span>
                              <span>
                                {(
                                  (item?.product?.offerPrice || 0) *
                                  (item.quantity || 1)
                                ).toFixed(2)}
                              </span>
                            </p>
                          </div>

                          {/* Order Status */}
                          <div className='flex-shrink-0 text-center sm:text-right mt-3 sm:mt-0'>
                            <p className='text-sm text-gray-600 mb-1'>Estado:</p>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === 'Delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : order.status === 'Shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {order.status === 'Processing'
                                ? '🔄 A Processar'
                                : order.status === 'Shipped'
                                ? '🚚 Enviado'
                                : order.status === 'Delivered'
                                ? '✅ Entregue'
                                : order.status === 'Pending'
                                ? '⏳ Pendente'
                                : '📦 A Aguardar Envio'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Order Footer */}
                  <div className='bg-gray-50 px-4 sm:px-5 py-3 border-t border-gray-200'>
                    <div className='flex flex-col sm:flex-row justify-between items-center gap-3'>
                      <div className='text-sm text-gray-600'>
                        <span>ID completo: </span>
                        <span className='font-mono text-xs bg-gray-200 px-2 py-1 rounded'>
                          {order._id}
                        </span>
                      </div>

                      <div className='flex gap-2'>
                        {order.paymentType === 'Online' && order.isPaid && (
                          <span className='text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium'>
                            ✅ Pagamento Confirmado
                          </span>
                        )}
                        {order.paymentType === 'COD' && (
                          <span className='text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium'>
                            💰 Pagar na Entrega
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;