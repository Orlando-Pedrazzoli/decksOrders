import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// DEBUG - Apenas em desenvolvimento
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
  const [familyCache, setFamilyCache] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  
  // OTIMIZADO: isLoading começa false - site carrega imediato
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
    localStorage.removeItem('guest_checkout_email');
    localStorage.removeItem('guest_checkout_address');
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

  // 🆕 Detectar se é mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // OTIMIZADO: fetchUser sem setIsLoading global
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

  // Enhanced logout function
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

  // Logout do Seller centralizado
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

  // Fetch Seller só quando necessário
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

  // Fetch All Products
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

  // =============================================================================
  // FUNÇÕES DE STOCK
  // =============================================================================

  // Função auxiliar para encontrar produto
  const findProduct = (productId) => {
    let product = products.find(p => p._id === productId);
    
    if (!product) {
      for (const familySlug in familyCache) {
        const familyProduct = familyCache[familySlug].find(p => p._id === productId);
        if (familyProduct) {
          product = familyProduct;
          break;
        }
      }
    }
    
    return product;
  };

  // Obter stock disponível de um produto
  const getAvailableStock = (productId) => {
    const product = findProduct(productId);
    return product?.stock || 0;
  };

  // Validar se pode adicionar ao carrinho
  const canAddToCart = (productId, quantityToAdd = 1) => {
    const product = findProduct(productId);
    
    if (!product) {
      return { can: false, reason: 'Produto não encontrado' };
    }
    
    const currentInCart = cartItems[productId] || 0;
    const availableStock = product.stock !== undefined ? product.stock : 999;
    
    if (availableStock === 0) {
      return { can: false, reason: 'Produto esgotado' };
    }
    
    if (currentInCart + quantityToAdd > availableStock) {
      return { 
        can: false, 
        reason: `Apenas ${availableStock} unidade(s) disponível(eis). Já tens ${currentInCart} no carrinho.`
      };
    }
    
    return { can: true };
  };

  // =============================================================================
  // FUNÇÕES DE FAMÍLIA/VARIANTES
  // =============================================================================

  // Buscar todos os produtos de uma família (com cache)
  const getProductFamily = async (familySlug) => {
    if (!familySlug) return [];
    
    if (familyCache[familySlug]) {
      return familyCache[familySlug];
    }
    
    try {
      const { data } = await axios.post('/api/product/family', { familySlug });
      
      if (data.success && data.products) {
        setFamilyCache(prev => ({
          ...prev,
          [familySlug]: data.products
        }));
        return data.products;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar família:', error);
      return [];
    }
  };

  // Limpar cache de uma família
  const clearFamilyCache = (familySlug) => {
    if (familySlug) {
      setFamilyCache(prev => {
        const newCache = { ...prev };
        delete newCache[familySlug];
        return newCache;
      });
    } else {
      setFamilyCache({});
    }
  };

  // =============================================================================
  // CART OPERATIONS COM VALIDAÇÃO DE STOCK
  // =============================================================================

  const addToCart = async itemId => {
    const validation = canAddToCart(itemId, 1);
    
    if (!validation.can) {
      toast.error(validation.reason);
      return false;
    }

    const newCartItems = { ...cartItems };

    if (newCartItems[itemId]) {
      newCartItems[itemId] += 1;
    } else {
      newCartItems[itemId] = 1;
    }

    setCartItems(newCartItems);
    saveCartToStorage(newCartItems);
    toast.success('Adicionado ao carrinho');
    
    setShowCartSidebar(true);

    if (user) {
      try {
        await axios.post('/api/cart/update', { cartItems: newCartItems });
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
    
    return true;
  };

  const updateCartItem = async (itemId, quantity) => {
    const newCartItems = { ...cartItems };

    if (quantity <= 0) {
      delete newCartItems[itemId];
      toast.success('Produto removido do carrinho');
    } else {
      const availableStock = getAvailableStock(itemId);
      
      if (availableStock > 0 && quantity > availableStock) {
        toast.error(`Apenas ${availableStock} unidade(s) disponível(eis)`);
        return false;
      }
      
      newCartItems[itemId] = quantity;
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
    toast.success('Removido do carrinho');

    if (user) {
      try {
        await axios.post('/api/cart/update', { cartItems: newCartItems });
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
  };

  const clearSearchQuery = () => {
    setSearchQuery('');
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = findProduct(items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
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

  // Inicialização rápida
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

  // Verificar seller apenas na primeira vez que entra na área de seller
  useEffect(() => {
    if (location.pathname.startsWith('/seller') && !isSeller && isSellerLoading) {
      fetchSeller();
    }
  }, [location.pathname]);

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
    isMobile,
    saveCartToStorage,
    loadCartFromStorage,
    saveUserToStorage,
    // Funções de stock
    getAvailableStock,
    canAddToCart,
    findProduct,
    // Funções de família/variantes
    getProductFamily,
    clearFamilyCache,
    familyCache,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};