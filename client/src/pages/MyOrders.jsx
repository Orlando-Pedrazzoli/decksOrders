import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();

  // ✅ ATUALIZADO PARA FUNCIONAR COM STRIPE
  const fetchMyOrders = async () => {
    try {
      console.log('🔍 Buscando pedidos para usuário:', user?._id);

      // ✅ USANDO POST com userId para compatibilidade com backend
      const { data } = await axios.post('/api/order/user', {
        userId: user._id,
      });

      console.log('📋 Resposta do servidor:', data);

      if (data.success) {
        console.log('📋 Pedidos carregados:', data.orders.length);

        // ✅ FILTRAR PEDIDOS: COD (sempre) + Online (só se pagos)
        const validOrders = data.orders.filter(order => {
          if (order.paymentType === 'COD') {
            return true; // COD sempre aparece
          }
          if (order.paymentType === 'Online') {
            return order.isPaid === true; // Stripe só se pago
          }
          return false;
        });

        console.log('✅ Pedidos válidos (filtrados):', validOrders.length);
        setMyOrders(validOrders);
      } else {
        console.error('❌ Erro ao buscar pedidos:', data.message);
      }
    } catch (error) {
      console.error('❌ Erro na requisição de pedidos:', error);
      console.error('❌ Status do erro:', error.response?.status);
      console.error('❌ Dados do erro:', error.response?.data);
    }
  };

  // ✅ IGUAL AO CÓDIGO QUE FUNCIONA
  useEffect(() => {
    if (user) {
      console.log('👤 Usuário encontrado, buscando pedidos...');
      fetchMyOrders();
    } else {
      console.log('❌ Usuário não encontrado');
      setMyOrders([]);
    }
  }, [user]);

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
    // Se tem valor final (com desconto), usar esse
    if (order.amount) {
      return order.amount.toFixed(2);
    }

    // Fallback: calcular manualmente
    let total = 0;
    order.items.forEach(item => {
      if (item.product && item.product.offerPrice) {
        total += item.product.offerPrice * item.quantity;
      }
    });

    // Adicionar taxa de 2%
    total += Math.floor(total * 0.02);

    // Aplicar desconto se houver
    if (order.discountAmount > 0) {
      total -= order.discountAmount;
    }

    return Math.max(0, total).toFixed(2);
  };

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-60px)] bg-gray-50'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center'>
          As Minhas Encomendas
        </h1>

        {myOrders.length === 0 ? (
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
                {/* Order Header - ATUALIZADO COM STRIPE INFO */}
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
                        {/* Mostrar desconto se aplicável */}
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
                        {/* Product Image */}
                        <div className='flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-lg overflow-hidden border border-gray-200'>
                          <img
                            src={
                              item?.product?.image?.[0] ||
                              assets.placeholder_image
                            }
                            alt={item?.product?.name || 'Imagem do Produto'}
                            className='w-full h-full object-contain'
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

                {/* Order Footer with Actions - NOVO */}
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
  );
};

export default MyOrders;
