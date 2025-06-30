import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets'; // Assuming you have an assets file for empty state images

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();

  const fetchMyOrders = async () => {
    try {
      // Show loading state if you have one
      const { data } = await axios.get('/api/order/user');
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error); // Use console.error for errors
      // Optionally show a toast error here
    }
  };

  useEffect(() => {
    // Only fetch orders if the user is logged in
    if (user) {
      fetchMyOrders();
    } else {
      // Clear orders if user logs out or isn't available
      setMyOrders([]);
    }
  }, [user]); // Re-fetch when user object changes

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
          myOrders.map((order, orderIndex) => (
            <div key={order._id || orderIndex} className='...'>
              <div className='bg-primary-light/50 p-4 sm:p-5 border-b border-gray-200'>
                <p className='flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm sm:text-base text-gray-700 font-medium'>
                  <span className='mb-2 sm:mb-0'>
                    <span className='font-semibold'>ID da Encomenda:</span>{' '}
                    {order._id}
                  </span>
                  <span className='mb-2 sm:mb-0'>
                    <span className='font-semibold'>Pagamento:</span>{' '}
                    {order.paymentMethod}
                  </span>
                  <span className='flex items-baseline'>
                    <span className='font-semibold mr-1'>Total:</span>
                    <span className='mr-0.5'>{currency}</span>
                    <span>
                      {order.totalAmount ? order.totalAmount.toFixed(2) : 'N/D'}
                    </span>
                  </span>
                </p>
                <p className='text-sm text-gray-600 mt-2 sm:mt-0'>
                  <span className='font-semibold'>Data da Encomenda:</span>{' '}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className='divide-y divide-gray-100'>
                {order.items
                  .filter(item => item?.product)
                  .map((item, itemIndex) => (
                    <div key={item?.product?._id || itemIndex} className='...'>
                      <div className='flex-grow order-1 sm:order-none'>
                        <h2 className='text-lg sm:text-xl font-semibold text-gray-800 mb-1'>
                          {item?.product?.name || 'Produto Indisponível'}
                        </h2>
                        <p className='text-sm text-gray-600'>
                          Categoria: {item?.product?.category || 'N/D'}
                        </p>
                      </div>

                      <div className='flex flex-col items-start sm:items-end flex-shrink-0 order-2 sm:order-none'>
                        <p className='text-sm text-gray-600'>
                          Quantidade:{' '}
                          <span className='font-medium'>
                            {item.quantity || '1'}
                          </span>
                        </p>
                        <p className='text-sm text-gray-600'>
                          Estado:{' '}
                          <span
                            className={`font-semibold ${
                              order.status === 'Delivered'
                                ? 'text-green-600'
                                : 'text-orange-500'
                            }`}
                          >
                            {order.status}
                          </span>
                        </p>
                      </div>

                      <div className='bg-gray-100 p-2 rounded-lg flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 order-3 sm:order-none'>
                        <img
                          src={
                            item?.product?.image?.[0] ||
                            assets.placeholder_image
                          }
                          alt={item?.product?.name || 'Imagem do Produto'}
                          className='w-full h-full object-contain rounded-md'
                        />
                      </div>

                      <div className='flex flex-col items-start sm:items-end flex-shrink-0 order-4 sm:order-none'>
                        <p className='text-primary-dark font-bold text-lg sm:text-xl flex items-baseline'>
                          <span className='mr-0.5'>{currency}</span>
                          <span>
                            {(
                              item?.product?.offerPrice * item.quantity
                            ).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
