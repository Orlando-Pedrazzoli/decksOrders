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
    isMobile,
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
  }, [products, cartItems, user]);

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
      .filter(Boolean);
    setCartArray(tempArray);
  };

  const loadUserAddresses = async () => {
    try {
      const { data } = await axios.get('/api/address/get');
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!requireLogin('place order')) return;
    if (!selectedAddress) {
      return toast.error('Please select an address');
    }

    setIsProcessing(true);
    try {
      const orderData = {
        userId: user._id,
        items: cartArray.map(item => ({
          product: item._id,
          quantity: item.quantity,
        })),
        address: selectedAddress._id,
        promoCode: discountApplied ? promoCode : undefined,
      };

      let response;
      if (paymentOption === 'COD') {
        response = await axios.post('/api/order/cod', orderData);
      } else {
        response = await axios.post('/api/order/stripe', orderData);
      }

      if (response.data.success) {
        if (paymentOption === 'COD') {
          toast.success('Order placed successfully!');
          setCartItems({});
          navigate('/my-orders');
        } else {
          window.location.href = response.data.url;
        }
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');

      // Handle token expiration for mobile
      if (error.response?.status === 401 && isMobile) {
        localStorage.removeItem('mobile_auth_token');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(getCartAmount());
    const tax = subtotal * 0.02;
    const totalBeforeDiscount = subtotal + tax;

    if (discountApplied) {
      const discount = subtotal * 0.3;
      return (totalBeforeDiscount - discount).toFixed(2);
    }
    return totalBeforeDiscount.toFixed(2);
  };

  const handlePromoCode = () => {
    if (!requireLogin('apply promo code')) return;

    if (promoCode.trim().toUpperCase() === validPromoCode) {
      setDiscountApplied(true);
      toast.success('30% discount applied!');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setDiscountApplied(false);
    toast('Promo code removed');
  };

  if (!products.length || !cartItems || Object.keys(cartItems).length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <img src={assets.empty_cart} alt='Empty cart' className='w-40 mb-4' />
        <h3 className='text-xl font-medium mb-2'>Your cart is empty</h3>
        <button
          onClick={() => navigate('/products')}
          className='bg-primary text-white px-6 py-2 rounded hover:bg-primary-dull transition'
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Cart Items Section */}
        <div className='lg:w-2/3'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-2xl font-bold'>
              Shopping Cart ({getCartCount()} items)
            </h1>
            <button
              onClick={() => navigate('/products')}
              className='flex items-center text-primary hover:underline'
            >
              Continue Shopping
              <img
                src={assets.arrow_right_icon_colored}
                alt='>'
                className='ml-1 h-4'
              />
            </button>
          </div>

          <div className='bg-white rounded-lg shadow overflow-hidden'>
            {/* Cart Items Table */}
            {cartArray.map(product => (
              <div
                key={product._id}
                className='flex flex-col sm:flex-row border-b p-4'
              >
                <div className='flex items-center sm:w-2/3 mb-4 sm:mb-0'>
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className='w-20 h-20 object-cover rounded border cursor-pointer'
                    onClick={() =>
                      navigate(
                        `/products/${product.category.toLowerCase()}/${
                          product._id
                        }`
                      )
                    }
                  />
                  <div className='ml-4'>
                    <h3 className='font-medium'>{product.name}</h3>
                    <p className='text-sm text-gray-500'>
                      Weight: {product.weight || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-between sm:w-1/3'>
                  <div className='flex items-center'>
                    <span className='mr-2'>Qty:</span>
                    <select
                      value={cartItems[product._id]}
                      onChange={e =>
                        updateCartItem(product._id, Number(e.target.value))
                      }
                      className='border rounded p-1'
                    >
                      {[...Array(20).keys()].map(num => (
                        <option key={num + 1} value={num + 1}>
                          {num + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='text-right'>
                    <p className='font-medium'>
                      {currency}
                      {(product.offerPrice * product.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className='text-red-500 hover:text-red-700 text-sm mt-1'
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className='lg:w-1/3'>
          <div className='bg-white rounded-lg shadow p-6 sticky top-4'>
            <h2 className='text-xl font-bold mb-4'>Order Summary</h2>

            {/* Address Selection */}
            <div className='mb-6'>
              <div className='flex justify-between items-center mb-2'>
                <h3 className='font-medium'>Delivery Address</h3>
                <button
                  onClick={() =>
                    requireLogin('select address') &&
                    setShowAddress(!showAddress)
                  }
                  className='text-primary text-sm hover:underline'
                >
                  Change
                </button>
              </div>

              {selectedAddress ? (
                <div className='bg-gray-50 p-3 rounded text-sm'>
                  <p>{selectedAddress.street}</p>
                  <p>
                    {selectedAddress.city}, {selectedAddress.state}
                  </p>
                  <p>{selectedAddress.country}</p>
                </div>
              ) : (
                <p className='text-sm text-gray-500'>No address selected</p>
              )}

              {showAddress && user && (
                <div className='mt-2 border rounded overflow-hidden'>
                  {addresses.map(address => (
                    <div
                      key={address._id}
                      onClick={() => {
                        setSelectedAddress(address);
                        setShowAddress(false);
                      }}
                      className='p-3 border-b hover:bg-gray-50 cursor-pointer'
                    >
                      <p>
                        {address.street}, {address.city}
                      </p>
                    </div>
                  ))}
                  <div
                    onClick={() => navigate('/add-address')}
                    className='p-3 text-primary hover:bg-gray-50 cursor-pointer text-center'
                  >
                    + Add New Address
                  </div>
                </div>
              )}
            </div>

            {/* Promo Code */}
            <div className='mb-6'>
              <h3 className='font-medium mb-2'>Promo Code</h3>
              <div className='flex'>
                <input
                  type='text'
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder='Enter promo code'
                  disabled={discountApplied}
                  className='flex-1 border rounded-l px-3 py-2 focus:outline-none'
                />
                {discountApplied ? (
                  <button
                    onClick={handleRemovePromo}
                    className='bg-red-500 text-white px-4 rounded-r hover:bg-red-600'
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handlePromoCode}
                    className='bg-primary text-white px-4 rounded-r hover:bg-primary-dull'
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className='mb-6'>
              <h3 className='font-medium mb-2'>Payment Method</h3>
              <select
                value={paymentOption}
                onChange={e =>
                  requireLogin('change payment') &&
                  setPaymentOption(e.target.value)
                }
                className='w-full border rounded p-2 focus:outline-none'
              >
                <option value='COD'>Cash on Delivery</option>
                <option value='Online'>Online Payment</option>
              </select>
            </div>

            {/* Order Total */}
            <div className='border-t pt-4'>
              <div className='flex justify-between mb-2'>
                <span>Subtotal:</span>
                <span>
                  {currency}
                  {getCartAmount()}
                </span>
              </div>
              {discountApplied && (
                <div className='flex justify-between text-green-600 mb-2'>
                  <span>Discount (30%):</span>
                  <span>
                    -{currency}
                    {(getCartAmount() * 0.3).toFixed(2)}
                  </span>
                </div>
              )}
              <div className='flex justify-between mb-2'>
                <span>Tax (2%):</span>
                <span>
                  {currency}
                  {(getCartAmount() * 0.02).toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between font-bold text-lg mt-4'>
                <span>Total:</span>
                <span>
                  {currency}
                  {calculateTotal()}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing || !selectedAddress}
              className={`w-full mt-6 py-3 rounded font-medium text-white ${
                isProcessing
                  ? 'bg-gray-400'
                  : 'bg-primary hover:bg-primary-dull'
              } transition`}
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
