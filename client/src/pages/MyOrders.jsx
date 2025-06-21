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
          My Orders
        </h1>

        {myOrders.length === 0 ? (
          <div className='flex flex-col items-center justify-center min-h-[50vh] text-center'>
            <img
              src={assets.empty_cart} // Using empty_cart as a placeholder for no orders image
              alt='No orders'
              className='w-48 sm:w-56 md:w-64 mb-6 opacity-75'
            />
            <p className='text-xl sm:text-2xl font-semibold mb-3 text-gray-700'>
              No orders found yet!
            </p>
            <p className='text-gray-600 max-w-md'>
              It looks like you haven't placed any orders. Start shopping now!
            </p>
            {/* You might want a button here to navigate to products */}
          </div>
        ) : (
          myOrders.map((order, orderIndex) => (
            <div
              key={order._id || orderIndex} // Use order._id if available, fallback to index
              className='bg-white rounded-xl shadow-lg mb-8 overflow-hidden border border-gray-200'
            >
              <div className='bg-primary-light/50 p-4 sm:p-5 border-b border-gray-200'>
                <p className='flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm sm:text-base text-gray-700 font-medium'>
                  <span className='mb-2 sm:mb-0'>
                    <span className='font-semibold'>Order ID:</span> {order._id}
                  </span>
                  <span className='mb-2 sm:mb-0'>
                    <span className='font-semibold'>Payment:</span>{' '}
                    {order.paymentMethod}
                  </span>
                  <span className='flex items-baseline'>
                    <span className='font-semibold mr-1'>Total:</span>
                    <span className='mr-0.5'>{currency}</span>
                    <span>
                      {order.totalAmount ? order.totalAmount.toFixed(2) : 'N/A'}
                    </span>
                  </span>
                </p>
                <p className='text-sm text-gray-600 mt-2 sm:mt-0'>
                  <span className='font-semibold'>Order Date:</span>{' '}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className='divide-y divide-gray-100'>
                {order.items
                  .filter(item => item?.product) // Ensure product exists
                  .map((item, itemIndex) => (
                    <div
                      key={item?.product?._id || itemIndex} // Use product._id or itemIndex
                      className='flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-5 gap-4'
                    >
                      {/* Product Name & Category */}
                      <div className='flex-grow order-1 sm:order-none'>
                        {' '}
                        {/* order-1 for mobile, order-none for desktop */}
                        <h2 className='text-lg sm:text-xl font-semibold text-gray-800 mb-1'>
                          {item?.product?.name || 'Product Unavailable'}
                        </h2>
                        <p className='text-sm text-gray-600'>
                          Category: {item?.product?.category || 'N/A'}
                        </p>
                      </div>

                      {/* Quantity and Status */}
                      <div className='flex flex-col items-start sm:items-end flex-shrink-0 order-2 sm:order-none'>
                        {' '}
                        {/* order-2 for mobile */}
                        <p className='text-sm text-gray-600'>
                          Quantity:{' '}
                          <span className='font-medium'>
                            {item.quantity || '1'}
                          </span>
                        </p>
                        <p className='text-sm text-gray-600'>
                          Status:{' '}
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

                      {/* Image - Moved for mobile order */}
                      <div className='bg-gray-100 p-2 rounded-lg flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 order-3 sm:order-none'>
                        {' '}
                        {/* order-3 for mobile */}
                        <img
                          src={
                            item?.product?.image?.[0] ||
                            assets.placeholder_image
                          } // Use a better placeholder from assets
                          alt={item?.product?.name || 'Product Image'}
                          className='w-full h-full object-contain rounded-md' // object-contain for better fit
                        />
                      </div>

                      {/* Price */}
                      <div className='flex flex-col items-start sm:items-end flex-shrink-0 order-4 sm:order-none'>
                        {' '}
                        {/* order-4 for mobile */}
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
