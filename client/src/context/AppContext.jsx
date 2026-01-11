import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

if (import.meta.env.DEV) {
  console.log('🔧 Backend URL:', import.meta.env.VITE_BACKEND_URL);
}

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSellerLoading, setIsSellerLoading] = useState(true);

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

  const getStoredToken = () => localStorage.getItem('auth_token');

  // Cart storage functions
  const saveCartToStorage = cartData => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  };

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart_items');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return {};
    }
  };

  // User storage functions
  const clearStoredData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('cart_items');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
  };

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

  const loadUserFromStorage = () => {
    try {
      const savedUser = localStorage.getItem('user_data');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      return null;
    }
  };

  // Fetch user
  const fetchUser = async () => {
    try {
      let response = await axios.get('/api/user/is-auth');

      if (response.data.success) {
        setUser(response.data.user);
        setCartItems(response.data.user.cartItems || {});
        saveUserToStorage(response.data.user);
        saveCartToStorage(response.data.user.cartItems || {});

        const token = getStoredToken();
        if (token && !axios.defaults.headers.common['Authorization']) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        return;
      }

      const storedToken = getStoredToken();
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          response = await axios.get('/api/user/is-auth');

          if (response.data.success) {
            setUser(response.data.user);
            setCartItems(response.data.user.cartItems || {});
            saveUserToStorage(response.data.user);
            saveCartToStorage(response.data.user.cartItems || {});
            return;
          }
        } catch (tokenError) {
          console.log('Token validation failed');
        }
      }

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
    } catch (error) {
      console.error('❌ Erro no fetchUser:', error);

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
    }
  };

  // Logout functions
  const logoutUser = async () => {
    try {
      await axios.get('/api/user/logout');
    } catch (error) {
      console.log('Server logout failed:', error);
    } finally {
      setUser(null);
      setCartItems({});
      clearStoredData();
      navigate('/');
      toast.success('Sessão terminada com sucesso');
    }
  };

  const logoutSeller = async () => {
    try {
      await axios.get('/api/seller/logout');
    } catch (error) {
      console.log('Seller logout request failed:', error);
    } finally {
      setIsSeller(false);
      sessionStorage.removeItem('seller_just_logged_in');
      sessionStorage.removeItem('seller_authenticated');
      navigate('/');
      toast.success('Logout do Admin realizado com sucesso');
    }
  };

  // Fetch seller
  const fetchSeller = async () => {
    try {
      setIsSellerLoading(true);
      const { data } = await axios.get('/api/seller/is-auth');
      
      if (data.success) {
        const isInSellerArea = window.location.pathname.startsWith('/seller');
        const justLoggedIn = sessionStorage.getItem('seller_just_logged_in');
        
        if (isInSellerArea || justLoggedIn) {
          setIsSeller(true);
          sessionStorage.setItem('seller_authenticated', 'true');
          sessionStorage.removeItem('seller_just_logged_in');
        } else {
          setIsSeller(false);
          sessionStorage.removeItem('seller_authenticated');
        }
      } else {
        setIsSeller(false);
        sessionStorage.removeItem('seller_authenticated');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar seller:', error.message);
      
      if (error.response?.status === 401) {
        setIsSeller(false);
        sessionStorage.removeItem('seller_authenticated');
        sessionStorage.removeItem('seller_just_logged_in');
      }
    } finally {
      setIsSellerLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // 🎯 HELPER: Obter stock disponível
  const getAvailableStock = (productId) => {
    const product = products.find(p => p._id === productId);
    return product?.stock || 0;
  };

  // 🎯 CART: Adicionar ao carrinho (SIMPLIFICADO - sem variantes)
  const addToCart = async (productId) => {
    // Validar stock primeiro
    const availableStock = getAvailableStock(productId);
    
    if (availableStock === 0) {
      toast.error('Produto esgotado');
      return false;
    }
    
    const currentQuantity = cartItems[productId] || 0;
    
    if (currentQuantity >= availableStock) {
      toast.error(`Apenas ${availableStock} unidade(s) disponível(eis)`);
      return false;
    }

    // Criar novo objeto de carrinho
    const newCartItems = { 
      ...cartItems,
      [productId]: currentQuantity + 1 
    };

    // Atualizar estado e storage
    setCartItems(newCartItems);
    saveCartToStorage(newCartItems);
    
    // Mostrar toast e abrir sidebar após um pequeno delay para garantir re-render
    toast.success('Adicionado ao carrinho');
    
    // Usar setTimeout para garantir que o state foi atualizado antes de abrir
    setTimeout(() => {
      setShowCartSidebar(true);
    }, 10);

    // Sync com servidor em background
    if (user) {
      try {
        await axios.post('/api/cart/update', { cartItems: newCartItems });
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
    
    return true;
  };

  // 🎯 CART: Atualizar item no carrinho
  const updateCartItem = async (productId, quantity) => {
    const newCartItems = { ...cartItems };

    if (quantity <= 0) {
      delete newCartItems[productId];
      toast.success('Produto removido do carrinho');
    } else {
      const availableStock = getAvailableStock(productId);
      
      if (quantity > availableStock) {
        toast.error(`Apenas ${availableStock} unidade(s) disponível(eis)`);
        return false;
      }
      
      newCartItems[productId] = quantity;
      toast.success('Carrinho atualizado');
    }

    setCartItems(newCartItems);
    saveCartToStorage(newCartItems);

    if (user) {
      try {
        await axios.post('/api/cart/update', { cartItems: newCartItems });
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
    
    return true;
  };

  // 🎯 CART: Remover do carrinho
  const removeFromCart = async (productId) => {
    const newCartItems = { ...cartItems };

    if (newCartItems[productId]) {
      newCartItems[productId] -= 1;
      if (newCartItems[productId] === 0) {
        delete newCartItems[productId];
      }
    }

    setCartItems(newCartItems);
    saveCartToStorage(newCartItems);
    toast.success('Removido do carrinho');

    if (user) {
      try {
        await axios.post('/api/cart/update', { cartItems: newCartItems });
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
  };

  const clearSearchQuery = () => setSearchQuery('');

  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    
    for (const productId in cartItems) {
      if (cartItems[productId] <= 0) continue;
      
      const product = products.find(p => p._id === productId);
      if (!product) continue;
      
      totalAmount += product.offerPrice * cartItems[productId];
    }
    
    return Math.floor(totalAmount * 100) / 100;
  };

  // 🎯 VALIDAR CARRINHO COMPLETO
  const validateCart = async () => {
    if (Object.keys(cartItems).length === 0) {
      return { valid: true, errors: [] };
    }
    
    try {
      const response = await axios.post('/api/cart/validate', { cartItems });
      return {
        valid: response.data.valid,
        errors: response.data.results?.filter(r => !r.valid) || [],
      };
    } catch (error) {
      console.error('Error validating cart:', error);
      return { valid: false, errors: [{ message: 'Erro ao validar carrinho' }] };
    }
  };

  // Axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        const token = getStoredToken();
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          setUser(null);
          setCartItems(loadCartFromStorage());
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
      const token = getStoredToken();
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const savedCart = loadCartFromStorage();
      setCartItems(savedCart);

      const savedUser = loadUserFromStorage();
      if (savedUser) {
        setUser(savedUser);
      }

      fetchProducts();
      fetchUser();

      if (window.location.pathname.startsWith('/seller')) {
        const sellerCached = sessionStorage.getItem('seller_authenticated');
        
        if (sellerCached === 'true') {
          setIsSeller(true);
          setIsSellerLoading(false);
          fetchSeller().catch(() => {
            console.log('⚠️ Verificação de seller falhou, mantendo sessão');
          });
        } else {
          fetchSeller();
        }
      } else {
        setIsSellerLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Check seller on route change
  useEffect(() => {
    if (location.pathname.startsWith('/seller') && !isSeller && isSellerLoading) {
      fetchSeller();
    }
  }, [location.pathname]);

  // Auto-sync cart with server
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
  }, [user]);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    showCartSidebar,
    setShowCartSidebar,
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
    fetchSeller,
    setCartItems,
    logoutUser,
    logoutSeller,
    setAuthToken,
    isLoading,
    isSellerLoading,
    saveCartToStorage,
    loadCartFromStorage,
    saveUserToStorage,
    getAvailableStock,
    validateCart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};