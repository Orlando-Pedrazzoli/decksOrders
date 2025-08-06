import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currency, axios, user } = useAppContext();

  const fetchMyOrders = async () => {
    try {
      // ✅ POST com userId (como o backend espera)
      const { data } = await axios.post('/api/order/user', {
        userId: user._id,
      });
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.error('Erro ao buscar encomendas:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    } else {
      console.log('⚠️ Usuário não logado');
      setMyOrders([]);
      setIsLoading(false);
    }
  }, [user]);

  // Loading state
  if (isLoading) {
    return (
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-60px)] bg-gray-50'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center'>
            As Minhas Encomendas
          </h1>
          <div className='flex items-center justify-center min-h-[50vh]'>
            <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-primary'></div>
          </div>
        </div>
      </div>
    );
  }

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
                      Encomenda ID: #{order._id}
                    </h3>
                    <p className='text-sm sm:text-base text-gray-700'>
                      Data:{' '}
                      {new Date(order.createdAt).toLocaleDateString('pt-PT')}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2'>
                    <p className='text-sm sm:text-base text-gray-700 font-medium'>
                      Método de Pagamento:{' '}
                      <span
                        className={`font-semibold ${
                          order.paymentType === 'COD'
                            ? 'text-orange-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {order.paymentType === 'COD'
                          ? 'Pagamento na Entrega'
                          : 'Pagamento Online (Stripe)'}
                      </span>
                      {order.paymentType === 'Online' && (
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            order.isPaid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.isPaid ? 'Pago' : 'Não Pago'}
                        </span>
                      )}
                    </p>

                    {/* Order Total */}
                    <div className='text-right'>
                      {order.originalAmount &&
                        order.originalAmount !== order.amount && (
                          <p className='text-sm text-gray-500 line-through'>
                            {currency} {order.originalAmount.toFixed(2)}
                          </p>
                        )}
                      <p className='text-lg sm:text-xl font-bold text-primary-dark'>
                        {currency}{' '}
                        {order.amount ? order.amount.toFixed(2) : '0.00'}
                      </p>
                      {order.promoCode && (
                        <p className='text-xs text-green-600 font-medium'>
                          Código: {order.promoCode} (-
                          {order.discountPercentage || 30}%)
                        </p>
                      )}
                    </div>
                  </div>
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
                                (item?.product?.offerPrice || 0) *
                                (item.quantity || 1)
                              ).toFixed(2)}
                            </span>
                          </p>
                        </div>

                        {/* Order Status */}
                        <div className='flex-shrink-0 text-center sm:text-right mt-3 sm:mt-0'>
                          <p className='text-sm text-gray-600'>
                            Estado:{' '}
                            <span
                              className={`font-semibold px-2 py-1 rounded-full text-xs ${
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
                                ? 'A Processar'
                                : order.status === 'Shipped'
                                ? 'Enviado'
                                : order.status === 'Delivered'
                                ? 'Entregue'
                                : order.status === 'Cancelled'
                                ? 'Cancelado'
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
