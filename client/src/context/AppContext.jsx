import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dummyProducts } from '../assets/assets';
import toast from 'react-hot-toast';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// Add mobile token interceptor
axios.interceptors.request.use(config => {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isIOS && typeof window !== 'undefined') {
    const mobileToken = localStorage.getItem('mobile_auth_token');
    if (mobileToken) {
      config.headers['Authorization'] = `Bearer ${mobileToken}`;
    }
  }
  return config;
});

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Check device type on mount
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  // Enhanced fetchUser with mobile token handling
  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/user/is-auth');

      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});

        // Store token for mobile Safari
        if (isMobile && data.token) {
          localStorage.setItem('mobile_auth_token', data.token);
        }
      } else {
        handleAuthFailure();
      }
    } catch (error) {
      handleAuthFailure(error);
    }
  };

  const handleAuthFailure = error => {
    setUser(null);
    if (isMobile) {
      localStorage.removeItem('mobile_auth_token');
    }
    if (error?.response?.status === 401) {
      toast.error('Session expired. Please login again.');
    }
  };

  // Enhanced fetchSeller with auth handling
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get('/api/seller/is-auth');
      setIsSeller(!!data?.success);
    } catch (error) {
      setIsSeller(false);
      if (error?.response?.status === 401) {
        handleAuthFailure(error);
      }
    }
  };

  // Fetch products with error boundary
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message || 'Failed to load products');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Network error');
    }
  };

  // Cart operations with sync to backend
  const addToCart = async itemId => {
    try {
      const newCartItems = { ...cartItems };
      newCartItems[itemId] = (newCartItems[itemId] || 0) + 1;

      setCartItems(newCartItems);
      await syncCart(newCartItems);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const newCartItems = { ...cartItems };
      newCartItems[itemId] = quantity;

      setCartItems(newCartItems);
      await syncCart(newCartItems);
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async itemId => {
    try {
      const newCartItems = { ...cartItems };
      if (newCartItems[itemId]) {
        newCartItems[itemId] -= 1;
        if (newCartItems[itemId] <= 0) {
          delete newCartItems[itemId];
        }
      }

      setCartItems(newCartItems);
      await syncCart(newCartItems);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  // Centralized cart sync function
  const syncCart = async items => {
    if (user) {
      await axios.post('/api/cart/update', { cartItems: items });
    }
  };

  // Product management
  const removeProduct = async id => {
    try {
      const { data } = await axios.post('/api/product/remove', { id });
      if (data.success) {
        toast.success(data.message);
        await fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Deletion failed');
    }
  };

  // Cart calculations
  const getCartCount = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  };

  const getCartAmount = () => {
    return Object.entries(cartItems)
      .reduce((total, [id, qty]) => {
        const product = products.find(p => p._id === id);
        return total + (product?.offerPrice || 0) * qty;
      }, 0)
      .toFixed(2);
  };

  // Initialize data and set up auth polling
  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();

    // Refresh auth every 5 minutes
    const interval = setInterval(fetchUser, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Context value
  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    fetchProducts,
    setCartItems,
    removeProduct,
    isMobile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
