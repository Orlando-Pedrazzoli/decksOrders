import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();

  // ✅ VOLTA PARA POST temporariamente até resolvermos o authUser
  const fetchMyOrders = async () => {
    try {
      console.log('🔍 Buscando pedidos para usuário:', user?._id);

      // ✅ VOLTA PARA POST com userId
      const { data } = await axios.post('/api/order/user', {
        userId: user._id,
      });

      console.log('📋 Resposta do servidor:', data);

      if (data.success) {
        console.log('📋 Pedidos carregados:', data.orders.length);
        setMyOrders(data.orders);
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
                {/* Order Header */}
                <div className='bg-primary-light/30 p-4 sm:p-5 border-b border-gray-200'>
                  <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2'>
                    <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-0'>
                      Encomenda ID: {order._id}
                    </h3>
                    <p className='text-sm sm:text-base text-gray-700'>
                      Data:{' '}
                      {new Date(order.createdAt).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  <p className='text-sm sm:text-base text-gray-700 font-medium'>
                    Método de Pagamento:{' '}
                    <span className='font-semibold'>
                      {order.paymentType === 'COD'
                        ? 'Pagamento na Entrega'
                        : 'Pagamento Online (Stripe)'}
                    </span>
                  </p>
                  <p className='text-sm sm:text-base text-gray-700 font-medium mt-1'>
                    Total da Encomenda:{' '}
                    <span className='font-semibold text-primary-dark'>
                      {currency}{' '}
                      {order.amount ? order.amount.toFixed(2) : '0.00'}
                    </span>
                  </p>
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
                          <p className='text-sm text-gray-600 mt-1'>
                            Quantidade:{' '}
                            <span className='font-semibold'>
                              {item.quantity || '1'}
                            </span>
                          </p>
                          <p className='text-primary-dark font-bold text-lg sm:text-xl flex items-baseline justify-center sm:justify-start mt-2'>
                            <span className='mr-0.5'>{currency}</span>
                            <span>
                              {(
                                item?.product?.offerPrice * item.quantity
                              ).toFixed(2)}
                            </span>
                          </p>
                        </div>

                        {/* Order Status */}
                        <div className='flex-shrink-0 text-center sm:text-right mt-3 sm:mt-0'>
                          <p className='text-sm text-gray-600'>
                            Estado:{' '}
                            <span
                              className={`font-semibold ${
                                order.status === 'Delivered'
                                  ? 'text-green-600'
                                  : order.status === 'Cancelled'
                                  ? 'text-red-500'
                                  : 'text-orange-500'
                              }`}
                            >
                              {order.status === 'Processing'
                                ? 'A Processar'
                                : order.status === 'Shipped'
                                ? 'Enviado'
                                : order.status === 'Delivered'
                                ? 'Entregue'
                                : order.status === 'Pending'
                                ? 'Pendente'
                                : 'A Aguardar Envio'}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
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
