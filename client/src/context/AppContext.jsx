import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// ⭐ DEBUG - Mas apenas em desenvolvimento
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
  
  // ✅ OTIMIZADO: isLoading começa false - site carrega imediato
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

  // ✅ OTIMIZADO: fetchUser sem setIsLoading global
  const fetchUser = async () => {
    try {
      // First, try to get user with existing session/cookie
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

      // If cookie auth failed, try with stored token
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

      // Try to load from localStorage as fallback
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

  // ✅ OTIMIZADO: Logout do Seller centralizado
  const logoutSeller = async () => {
    try {
      await axios.get('/api/seller/logout');
    } catch (error) {
      console.log('Seller logout request failed:', error);
    } finally {
      setIsSeller(false);
      sessionStorage.removeItem('seller_just_logged_in');
      sessionStorage.removeItem('seller_authenticated'); // ✅ Limpar cache
      navigate('/');
      toast.success('Logout do Admin realizado com sucesso');
    }
  };

  // ✅ OTIMIZADO: Fetch Seller só quando necessário
  const fetchSeller = async () => {
    try {
      setIsSellerLoading(true);
      const { data } = await axios.get('/api/seller/is-auth');
      
      if (data.success) {
        const isInSellerArea = window.location.pathname.startsWith('/seller');
        const justLoggedIn = sessionStorage.getItem('seller_just_logged_in');
        
        if (isInSellerArea || justLoggedIn) {
          setIsSeller(true);
          // ✅ Cachear autenticação no sessionStorage
          sessionStorage.setItem('seller_authenticated', 'true');
          sessionStorage.removeItem('seller_just_logged_in');
        } else {
          setIsSeller(false);
          sessionStorage.removeItem('seller_authenticated');
        }
      } else {
        // Só desloga se a resposta do servidor for explicitamente false
        setIsSeller(false);
        sessionStorage.removeItem('seller_authenticated');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar seller:', error.message);
      
      // ✅ CRÍTICO: Não desloga em erro de rede
      // Apenas desloga se for erro 401 (não autorizado)
      if (error.response?.status === 401) {
        setIsSeller(false);
        sessionStorage.removeItem('seller_authenticated');
        sessionStorage.removeItem('seller_just_logged_in');
      }
      // Se for erro de rede, mantém o estado atual (não limpa o cache)
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

  // 🎯 HELPER: Extrair productId e variantId de uma cartKey
  const parseCartKey = (cartKey) => {
    const parts = cartKey.split('_');
    return {
      productId: parts[0],
      variantId: parts[1] || null,
    };
  };

  // 🎯 HELPER: Criar cartKey a partir de productId e variantId
  const createCartKey = (productId, variantId = null) => {
    return variantId ? `${productId}_${variantId}` : productId;
  };

  // 🎯 HELPER: Obter informações do produto e variante
  const getProductInfo = (cartKey) => {
    const { productId, variantId } = parseCartKey(cartKey);
    const product = products.find(p => p._id === productId);
    
    if (!product) return null;
    
    let variant = null;
    if (variantId && product.variants && product.variants.length > 0) {
      variant = product.variants.find(v => v._id === variantId);
    }
    
    return { product, variant, productId, variantId };
  };

  // 🎯 HELPER: Obter stock disponível para um item do carrinho
  const getAvailableStock = (cartKey) => {
    const info = getProductInfo(cartKey);
    if (!info) return 0;
    
    const { product, variant } = info;
    
    if (variant) {
      return variant.stock || 0;
    }
    
    // Se tem variantes mas nenhuma selecionada, retornar stock total
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((total, v) => total + (v.stock || 0), 0);
    }
    
    return product.stock || 0;
  };

  // 🆕 ATUALIZADO: addToCart aceita tanto cartKey como (productId, variantId)
  // Formatos aceitos:
  // - addToCart('productId') - produto sem variante
  // - addToCart('productId_variantId') - produto com variante (cartKey)
  // - addToCart('productId', 'variantId') - produto com variante (dois args)
  const addToCart = async (productIdOrCartKey, variantId = null) => {
    let cartKey;
    
    // Detectar se é cartKey (contém _) ou productId simples
    if (variantId) {
      // Dois argumentos: productId e variantId
      cartKey = createCartKey(productIdOrCartKey, variantId);
    } else if (productIdOrCartKey.includes('_')) {
      // Um argumento com _ : é um cartKey completo
      cartKey = productIdOrCartKey;
    } else {
      // Um argumento sem _ : é um productId simples
      cartKey = productIdOrCartKey;
    }
    const newCartItems = { ...cartItems };
    const currentQuantity = newCartItems[cartKey] || 0;
    
    // 🎯 VALIDAR STOCK
    const availableStock = getAvailableStock(cartKey);
    
    if (availableStock === 0) {
      toast.error('Produto esgotado');
      return false;
    }
    
    if (currentQuantity >= availableStock) {
      toast.error(`Apenas ${availableStock} unidade(s) disponível(eis)`);
      return false;
    }

    newCartItems[cartKey] = currentQuantity + 1;

    setCartItems(newCartItems);
    saveCartToStorage(newCartItems);
    toast.success('Adicionado ao carrinho');
    
    // ✅ Abrir sidebar do carrinho
    setShowCartSidebar(true);

    if (user) {
      try {
        const response = await axios.post('/api/cart/update', { cartItems: newCartItems });
        
        // 🎯 Verificar se o servidor reportou erros de stock
        if (!response.data.success && response.data.stockErrors) {
          // Reverter alteração local
          setCartItems(cartItems);
          saveCartToStorage(cartItems);
          
          const error = response.data.stockErrors[0];
          toast.error(error.message);
          return false;
        }
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
    
    return true;
  };

  // 🆕 ATUALIZADO: updateCartItem com validação de stock
  const updateCartItem = async (cartKey, quantity) => {
    const newCartItems = { ...cartItems };

    if (quantity <= 0) {
      delete newCartItems[cartKey];
      toast.success('Produto removido do carrinho');
    } else {
      // 🎯 VALIDAR STOCK
      const availableStock = getAvailableStock(cartKey);
      
      if (quantity > availableStock) {
        toast.error(`Apenas ${availableStock} unidade(s) disponível(eis)`);
        return false;
      }
      
      newCartItems[cartKey] = quantity;
      toast.success('Carrinho atualizado');
    }

    setCartItems(newCartItems);
    saveCartToStorage(newCartItems);

    if (user) {
      try {
        const response = await axios.post('/api/cart/update', { cartItems: newCartItems });
        
        if (!response.data.success && response.data.stockErrors) {
          // Reverter alteração local
          setCartItems(cartItems);
          saveCartToStorage(cartItems);
          
          const error = response.data.stockErrors[0];
          toast.error(error.message);
          return false;
        }
      } catch (error) {
        console.error('Error syncing cart with server:', error);
      }
    }
    
    return true;
  };

  // 🆕 ATUALIZADO: removeFromCart suporta cartKey com variante
  const removeFromCart = async (cartKey) => {
    const newCartItems = { ...cartItems };

    if (newCartItems[cartKey]) {
      newCartItems[cartKey] -= 1;
      if (newCartItems[cartKey] === 0) {
        delete newCartItems[cartKey];
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

  // 🆕 ATUALIZADO: getCartAmount suporta cartKeys com variantes
  const getCartAmount = () => {
    let totalAmount = 0;
    
    for (const cartKey in cartItems) {
      if (cartItems[cartKey] <= 0) continue;
      
      const info = getProductInfo(cartKey);
      if (!info) continue;
      
      const { product, variant } = info;
      
      // Usar preço da variante se existir, senão usar preço do produto
      const price = variant?.offerPrice || variant?.price || product.offerPrice;
      
      totalAmount += price * cartItems[cartKey];
    }
    
    return Math.floor(totalAmount * 100) / 100;
  };

  // 🆕 NOVO: Validar todo o carrinho antes do checkout
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

  // ✅ OTIMIZADO: Inicialização rápida
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Carregar dados locais IMEDIATAMENTE (sem await)
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

      // 2. Buscar produtos (não bloqueia)
      fetchProducts();

      // 3. Verificar usuário em background
      fetchUser();

      // 4. ✅ MELHORADO: Verificar seller com cache de sessionStorage
      if (window.location.pathname.startsWith('/seller')) {
        // Verificar cache primeiro
        const sellerCached = sessionStorage.getItem('seller_authenticated');
        
        if (sellerCached === 'true') {
          // Restaurar estado do cache
          setIsSeller(true);
          setIsSellerLoading(false);
          
          // Verificar em background (não bloqueia)
          fetchSeller().catch(() => {
            // Se falhar a verificação em background, mantém o cache por enquanto
            console.log('⚠️ Verificação de seller falhou, mantendo sessão');
          });
        } else {
          // Não há cache, precisa verificar
          fetchSeller();
        }
      } else {
        setIsSellerLoading(false);
      }
    };

    initializeApp();
  }, []);

  // ✅ Verificar seller apenas na primeira vez que entra na área de seller
  useEffect(() => {
    // Só verifica se:
    // 1. Está na área de seller
    // 2. Ainda não verificou (isSellerLoading é true) OU não está logado como seller
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
    saveCartToStorage,
    loadCartFromStorage,
    saveUserToStorage,
    // 🆕 NOVOS EXPORTS
    parseCartKey,
    createCartKey,
    getProductInfo,
    getAvailableStock,
    validateCart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};