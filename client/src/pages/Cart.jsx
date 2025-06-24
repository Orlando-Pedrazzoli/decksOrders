import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';

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
    isMobile, // You're already using this, great!
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState('COD');
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const validPromoCode = 'BROTHER';

  // Auto-scroll to top and load data
  useEffect(() => {
    window.scrollTo(0, 0);
    if (products.length > 0 && cartItems) {
      updateCartArray();
    }
    if (user) {
      loadUserAddresses();
    }
  }, [products, cartItems, user]); // Added user as dependency for loadUserAddresses

  const requireLogin = action => {
    if (!user) {
      setShowUserLogin(true);
      toast.error(`Please login to ${action}`);
      return false;
    }
    return true;
  };

  const updateCartArray = () => {
    const tempArray = Object.keys(cartItems)
      .map(key => {
        const product = products.find(item => item._id === key);
        return product ? { ...product, quantity: cartItems[key] } : null;
      })
      .filter(Boolean); // Remove any nulls if product not found
    setCartArray(tempArray);
  };

  const loadUserAddresses = async () => {
    try {
      const { data } = await axios.get('/api/address/get');
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          // Set the first address as selected by default, or keep previous if exists
          setSelectedAddress(prev => prev || data.addresses[0]);
        } else {
          setSelectedAddress(null);
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toast.error('Failed to load addresses.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!requireLogin('place order')) return;
    if (!selectedAddress) {
      return toast.error('Please select a delivery address.');
    }
    if (cartArray.length === 0) {
      return toast.error(
        'Your cart is empty. Add items before placing an order.'
      );
    }

    setIsProcessing(true);
    try {
      const orderData = {
        userId: user._id,
        items: cartArray.map(item => ({
          product: item._id,
          quantity: item.quantity,
          priceAtOrder: item.offerPrice, // Capture price at the time of order
        })),
        address: selectedAddress._id,
        promoCode: discountApplied ? promoCode : undefined,
        totalAmount: parseFloat(calculateTotal()), // Ensure total is sent
        paymentMethod: paymentOption, // Send payment method
      };

      let response;
      if (paymentOption === 'COD') {
        response = await axios.post('/api/order/cod', orderData);
      } else {
        // Assume Stripe for 'Online' payment
        response = await axios.post('/api/order/stripe', orderData);
      }

      if (response.data.success) {
        if (paymentOption === 'COD') {
          toast.success('Order placed successfully!');
          setCartItems({}); // Clear cart after successful COD order
          navigate('/my-orders');
        } else {
          // Redirect for Stripe payment
          window.location.href = response.data.url;
        }
      } else {
        toast.error(response.data.message || 'Failed to place order.');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to place order. Please try again.'
      );

      // Handle token expiration for mobile (already good)
      if (error.response?.status === 401 && isMobile) {
        localStorage.removeItem('mobile_auth_token'); // Clear token
        // Assuming setUser and navigate are available from context if needed
        // setUser(null);
        // navigate('/');
        setShowUserLogin(true); // Prompt login
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(getCartAmount());
    const tax = subtotal * 0.02; // 2% tax
    let totalBeforeDiscount = subtotal + tax;

    if (discountApplied) {
      const discount = subtotal * 0.3; // 30% discount on subtotal
      totalBeforeDiscount -= discount;
    }
    // Ensure total is not negative
    return Math.max(0, totalBeforeDiscount).toFixed(2);
  };

  const handlePromoCode = () => {
    if (!requireLogin('apply promo code')) return;

    if (promoCode.trim().toUpperCase() === validPromoCode) {
      setDiscountApplied(true);
      toast.success('30% discount applied!');
    } else {
      toast.error('Invalid promo code. Try "BROTHER"'); // Hint for testing
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setDiscountApplied(false);
    toast('Promo code removed.');
  };

  // If cart is empty
  if (!products.length || !cartItems || Object.keys(cartItems).length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-gray-50'>
        <img
          src={assets.empty_cart}
          alt='Empty cart'
          className='w-56 sm:w-64 md:w-72 mb-6 max-w-full'
        />
        <h3 className='text-xl sm:text-2xl font-semibold mb-3 text-gray-700'>
          O seu carrinho está vazio!
        </h3>
        <p className='text-gray-600 mb-6 max-w-md'>
          Parece que ainda não adicionou nada ao seu carrinho. Explore os nossos
          produtos e descubra algo de que goste!
        </p>
        <button
          onClick={() => navigate('/products')}
          className='bg-primary text-white px-7 py-3 rounded-lg shadow-md hover:bg-primary-dull transition-all duration-300 text-base font-medium active:scale-95'
        >
          Explorar produtos
        </button>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-[calc(100vh-60px)]'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Cart Items Section */}
        <div className='lg:w-2/3'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6'>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0'>
              Shopping Cart ({getCartCount()} items)
            </h1>
            <button
              onClick={() => navigate('/products')}
              className='flex items-center text-primary-dark hover:underline text-sm sm:text-base font-medium'
            >
              Continue Shopping
              <img
                src={assets.arrow_right_icon_colored}
                alt='>'
                className='ml-1 h-4 w-4'
              />
            </button>
          </div>

          <div className='bg-white rounded-xl shadow-lg overflow-hidden divide-y divide-gray-200'>
            {cartArray.map(product => (
              <div
                key={product._id}
                className='flex flex-col sm:flex-row items-center p-4 sm:p-6'
              >
                <div className='flex items-center w-full sm:w-2/3 mb-4 sm:mb-0'>
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className='w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-transform duration-200 hover:scale-[1.02]'
                    onClick={() =>
                      navigate(
                        `/products/${product.category.toLowerCase()}/${
                          product._id
                        }`
                      )
                    }
                  />
                  <div className='ml-4 flex-grow'>
                    <h3 className='font-semibold text-lg text-gray-800'>
                      {product.name}
                    </h3>
                    <p className='text-sm text-gray-500 mt-1'>
                      Weight: {product.weight || 'N/A'}
                    </p>
                    <p className='font-medium text-gray-700 mt-2 text-base sm:hidden'>
                      {currency}{' '}
                      {(product.offerPrice * product.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className='flex justify-between items-center w-full sm:w-1/3 sm:justify-end sm:gap-8'>
                  <div className='flex items-center'>
                    <span className='mr-2 text-gray-600'>Qty:</span>
                    <select
                      value={cartItems[product._id]}
                      onChange={e =>
                        updateCartItem(product._id, Number(e.target.value))
                      }
                      className='border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none cursor-pointer'
                    >
                      {[...Array(20).keys()].map(num => (
                        <option key={num + 1} value={num + 1}>
                          {num + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='text-right hidden sm:block'>
                    {/* Currency alignment fix: added flex and items-baseline */}
                    <p className='font-bold text-lg text-gray-800 flex items-baseline justify-end'>
                      <span className='mr-0.5'>{currency}</span>
                      <span>
                        {(product.offerPrice * product.quantity).toFixed(2)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className='text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200 ml-4 cursor-pointer'
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className='lg:w-1/3'>
          <div className='bg-white rounded-xl shadow-lg p-6 sticky lg:top-8'>
            <h2 className='text-2xl font-bold mb-5 text-gray-800'>
              Order Summary
            </h2>

            {/* Address Selection */}
            <div className='mb-6 border-b pb-6 border-gray-200'>
              <div className='flex justify-between items-center mb-3'>
                <h3 className='font-semibold text-gray-700'>
                  Delivery Address
                </h3>
                <button
                  onClick={() =>
                    requireLogin('select address') &&
                    setShowAddress(!showAddress)
                  }
                  className='text-primary-dark text-sm hover:underline font-medium'
                >
                  {showAddress ? 'Close' : 'Change'}
                </button>
              </div>

              {selectedAddress ? (
                <div className='bg-gray-50 p-4 rounded-lg text-sm text-gray-700 border border-gray-200'>
                  <p className='font-medium'>{selectedAddress.street}</p>
                  <p>
                    {selectedAddress.city}, {selectedAddress.state}{' '}
                    {selectedAddress.zipcode}
                  </p>
                  <p>{selectedAddress.country}</p>
                </div>
              ) : (
                <p className='text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200'>
                  No address selected. Please add or select one.
                </p>
              )}

              {showAddress && user && (
                <div className='mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white'>
                  {addresses.length > 0 ? (
                    addresses.map(address => (
                      <div
                        key={address._id}
                        onClick={() => {
                          setSelectedAddress(address);
                          setShowAddress(false);
                        }}
                        className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-primary-light/20 cursor-pointer text-sm text-gray-800 transition-colors duration-200 ${
                          selectedAddress?._id === address._id
                            ? 'bg-primary-light/30'
                            : ''
                        }`}
                      >
                        <p className='font-medium'>{address.street}</p>
                        <p>
                          {address.city}, {address.state}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className='p-3 text-gray-600 text-sm text-center'>
                      No saved addresses.
                    </p>
                  )}
                  <div
                    onClick={() => {
                      if (requireLogin('add a new address')) {
                        navigate('/add-address');
                      }
                    }}
                    className='p-3 text-primary-dark hover:bg-primary-light/20 cursor-pointer text-center font-medium transition-colors duration-200 border-t border-gray-200'
                  >
                    + Add New Address
                  </div>
                </div>
              )}
            </div>

            {/* Promo Code */}
            <div className='mb-6 border-b pb-6 border-gray-200'>
              <h3 className='font-semibold text-gray-700 mb-3'>Promo Code</h3>
              <div className='flex w-full'>
                <input
                  type='text'
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder='Enter promo code'
                  disabled={discountApplied}
                  // Added text-center for mobile placeholder alignment
                  // min-w-0 and flex-shrink-0 for responsiveness
                  className='flex-1 min-w-0 border border-gray-300 rounded-l-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-700 disabled:bg-gray-100 placeholder:text-center sm:placeholder:text-left'
                />
                {discountApplied ? (
                  <button
                    onClick={handleRemovePromo}
                    className='bg-red-500 text-white px-5 py-2.5 rounded-r-lg hover:bg-red-600 transition-all duration-300 font-medium active:scale-95 flex-shrink-0'
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handlePromoCode}
                    className='bg-primary text-white px-5 py-2.5 rounded-r-lg hover:bg-primary-dull transition-all duration-300 font-medium active:scale-95 flex-shrink-0'
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className='mb-6 border-b pb-6 border-gray-200'>
              <h3 className='font-semibold text-gray-700 mb-3'>
                Payment Method
              </h3>
              <select
                value={paymentOption}
                onChange={e =>
                  requireLogin('change payment') &&
                  setPaymentOption(e.target.value)
                }
                className='w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 cursor-pointer'
              >
                <option value='COD'>Cash on Delivery</option>
                <option value='Online'>Online Payment (Stripe)</option>
              </select>
            </div>

            {/* Order Total */}
            <div className='pt-4'>
              <div className='flex justify-between items-center mb-3 text-gray-700'>
                <span>Subtotal ({getCartCount()} items):</span>
                {/* Currency alignment fix: added flex and items-baseline */}
                <span className='font-medium text-lg flex items-baseline'>
                  <span className='mr-0.5'>{currency}</span>
                  <span>{parseFloat(getCartAmount()).toFixed(2)}</span>
                </span>
              </div>
              {discountApplied && (
                <div className='flex justify-between items-center text-green-600 mb-3'>
                  <span>Discount (30%):</span>
                  {/* Currency alignment fix: added flex and items-baseline */}
                  <span className='font-medium text-lg flex items-baseline'>
                    <span className='mr-0.5'>-{currency}</span>
                    <span>
                      {(parseFloat(getCartAmount()) * 0.3).toFixed(2)}
                    </span>
                  </span>
                </div>
              )}
              <div className='flex justify-between items-center mb-3 text-gray-700'>
                <span>Tax (2%):</span>
                {/* Currency alignment fix: added flex and items-baseline */}
                <span className='font-medium text-lg flex items-baseline'>
                  <span className='mr-0.5'>{currency}</span>
                  <span>{(parseFloat(getCartAmount()) * 0.02).toFixed(2)}</span>
                </span>
              </div>
              <div className='flex justify-between font-bold text-xl mt-5 pt-3 border-t border-gray-200'>
                <span>Total:</span>
                {/* Currency alignment fix: added flex and items-baseline */}
                <span className='text-primary-dark flex items-baseline'>
                  <span className='mr-0.5'>{currency}</span>
                  <span>{calculateTotal()}</span>
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={
                isProcessing || !selectedAddress || cartArray.length === 0
              }
              className={`w-full mt-8 py-3.5 rounded-lg font-bold text-white text-lg shadow-md transition-all duration-300 active:scale-98
                ${
                  isProcessing || !selectedAddress || cartArray.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dull'
                }`}
            >
              {isProcessing
                ? 'Processing...'
                : paymentOption === 'COD'
                ? 'Place Order'
                : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
