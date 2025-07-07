import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// ⭐ DEBUG - Mas apenas em desenvolvimento
if (import.meta.env.DEV) {
  console.log('🔧 Backend URL:', import.meta.env.VITE_BACKEND_URL);
  console.log('🔧 Environment:', import.meta.env.MODE);
  console.log('🔧 All env vars:', import.meta.env);
}

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Token management functions
  const setAuthToken = token => {
    if (token) {
      localStorage.setItem('auth_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const getStoredToken = () => {
    return localStorage.getItem('auth_token');
  };

  // Save cart to localStorage
  const saveCartToStorage = cartData => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  };

  // Load cart from localStorage
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart_items');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return {};
    }
  };

  // Clear all stored data
  const clearStoredData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('cart_items');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Save user data to localStorage
  const saveUserToStorage = userData => {
    try {
      if (userData) {
        localStorage.setItem('user_data', JSON.stringify(userData));
      } else {
        localStorage.removeItem('user_data');
      }
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  };

  // Load user data from localStorage
  const loadUserFromStorage = () => {
    try {
      const savedUser = localStorage.getItem('user_data');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      return null;
    }
  };

  // ✅ CORREÇÃO: Enhanced fetch user function with better error handling
  const fetchUser = async () => {
    try {
      console.log(
        '🔍 Fazendo request para:',
        axios.defaults.baseURL + '/api/user/is-auth'
      );
      setIsLoading(true);

      // First, try to get user with existing session/cookie
      let response = await axios.get('/api/user/is-auth'); // ✅ CORRIGIDO: Adicionada barra inicial

      if (response.data.success) {
        setUser(response.data.user);
        setCartItems(response.data.user.cartItems || {});
        saveUserToStorage(response.data.user);
        saveCartToStorage(response.data.user.cartItems || {});

        // If we have a token but no auth header, set it
        const token = getStoredToken();
        if (token && !axios.defaults.headers.common['Authorization']) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        return;
      }

      // If cookie auth failed, try with stored token
      const storedToken = getStoredToken();
      if (storedToken) {
        axios.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${storedToken}`;

        try {
          response = await axios.get('/api/user/is-auth'); // ✅ CORRIGIDO: Adicionada barra inicial

          if (response.data.success) {
            setUser(response.data.user);
            setCartItems(response.data.user.cartItems || {});
            saveUserToStorage(response.data.user);
            saveCartToStorage(response.data.user.cartItems || {});
            return;
          }
        } catch (tokenError) {
          console.log('Token validation failed:', tokenError);
        }
      }

      // If both methods failed, try to load from localStorage as fallback
      const savedUser = loadUserFromStorage();
      const savedCart = loadCartFromStorage();

      if (savedUser) {
        setUser(savedUser);
        setCartItems(savedCart);

        // Try to refresh the session in background
        setTimeout(() => {
          fetchUser();
        }, 2000);
      } else {
        // No user found anywhere, clear everything
        setUser(null);
        setCartItems({});
        clearStoredData();
      }
    } catch (error) {
      console.error('❌ Erro no fetchUser:', error);
      console.error('❌ URL tentada:', axios.defaults.baseURL);

      // Try to use stored data as fallback
      const savedUser = loadUserFromStorage();
      const savedCart = loadCartFromStorage();

      if (savedUser) {
        setUser(savedUser);
        setCartItems(savedCart);
      } else {
        setUser(null);
        setCartItems({});
        clearStoredData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced logout function
  const logoutUser = async () => {
    try {
      // Try to logout from server
      await axios.get('/api/user/logout');
    } catch (error) {
      console.log('Server logout failed:', error);
    } finally {
      // Always clear local data
      setUser(null);
      setCartItems({});
      clearStoredData();
      navigate('/');
      toast.success('Logged out successfully');
    }
  };

  // Fetch Seller Status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get('/api/seller/is-auth');
      setIsSeller(data.success);
    } catch (error) {
      setIsSeller(false);
    }
  };

  // Fetch All Products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  // Enhanced cart operations with localStorage backup
  const addToCart = async itemId => {
    const newCartItems = { ...cartItems };

    if (newCartItems[itemId]) {
      newCartItems[itemId] += 1;
    } else {
      newCartItems[itemId] = 1;
    }

    setCartItems(newCartItems);
    saveCartToStorage(newCartItems);
    toast.success('Added to Cart');

    // Sync with server if user is logged in
    if (user) {
      try {
        await axios.post('/api/cart/update', { cartItems: newCartItems });
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    const newCartItems = { ...cartItems };
    newCartItems[itemId] = quantity;

    setCartItems(newCartItems);
    saveCartToStorage(newCartItems);
    toast.success('Cart Updated');

    // Sync with server if user is logged in
    if (user) {
      try {
        await axios.post('/api/cart/update', { cartItems: newCartItems });
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
  };

  const removeFromCart = async itemId => {
    const newCartItems = { ...cartItems };

    if (newCartItems[itemId]) {
      newCartItems[itemId] -= 1;
      if (newCartItems[itemId] === 0) {
        delete newCartItems[itemId];
      }
    }

    setCartItems(newCartItems);
    saveCartToStorage(newCartItems);
    toast.success('Removed from Cart');

    // Sync with server if user is logged in
    if (user) {
      try {
        await axios.post('/api/cart/update', { cartItems: newCartItems });
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
  };

  // Clear search query
  const clearSearchQuery = () => {
    setSearchQuery('');
  };

  // Get Cart Item Count
  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };

  // Get Cart Total Amount
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find(product => product._id === items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  // Enhanced axios interceptor for token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        const token = getStoredToken();
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.log('Authentication failed, clearing stored data');
          setUser(null);
          setCartItems(loadCartFromStorage()); // Keep cart but clear user
          clearStoredData();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      // Set token if available
      const token = getStoredToken();
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Load cart from storage immediately
      const savedCart = loadCartFromStorage();
      setCartItems(savedCart);

      // Fetch data
      await Promise.all([fetchUser(), fetchSeller(), fetchProducts()]);
    };

    initializeApp();
  }, []);

  // Auto-sync cart with server when user changes
  useEffect(() => {
    const syncCartWithServer = async () => {
      if (user && Object.keys(cartItems).length > 0) {
        try {
          await axios.post('/api/cart/update', { cartItems });
        } catch (error) {
          console.error('Error syncing cart with server:', error);
        }
      }
    };

    syncCartWithServer();
  }, [user]); // Only when user changes

  const value = {
    navigate,
    user,
    setUser,
    setIsSeller,
    isSeller,
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
    clearSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    fetchProducts,
    setCartItems,
    logoutUser,
    setAuthToken,
    isLoading,
    saveCartToStorage,
    loadCartFromStorage,
    saveUserToStorage, // ✅ ADICIONADO: Exporte esta função também
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
