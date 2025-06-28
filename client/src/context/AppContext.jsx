import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

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

  // Interceptor para lidar com respostas 401 (não autorizado)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        console.log('=== AXIOS INTERCEPTOR DEBUG ===');
        console.log('Error status:', error.response?.status);
        console.log('Error message:', error.message);
        console.log('Current URL:', window.location.href);
        console.log('===============================');

        if (error.response?.status === 401) {
          console.log('🔐 401 recebido, limpando estado do usuário');
          setUser(null);
          setCartItems({});

          // Não redirecionar automaticamente, apenas limpar estado
          // Deixar o usuário decidir quando fazer login novamente

          // Mostrar toast apenas se não for uma verificação de auth silenciosa
          if (!error.config?.url?.includes('is-auth')) {
            toast.error('Sessão expirada. Faça login novamente.');
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup do interceptor
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // Fetch Seller Status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get('/api/seller/is-auth');
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      console.log('Seller auth check failed:', error.message);
      setIsSeller(false);
    }
  };

  // Fetch User Auth Status , User Data and Cart Items
  const fetchUser = async () => {
    try {
      console.log('🔍 Verificando autenticação do usuário...');

      // Verificar se o usuário fez logout recentemente
      if (sessionStorage.getItem('userLoggedOut') === 'true') {
        console.log('👋 Usuário fez logout recentemente, limpando estado');
        sessionStorage.removeItem('userLoggedOut');
        setUser(null);
        setCartItems({});
        return;
      }

      const { data } = await axios.get('/api/user/is-auth');

      console.log('📊 Resposta do servidor:', data);

      if (data.success && data.user) {
        console.log('✅ Usuário autenticado:', data.user);
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        console.log('❌ Usuário não autenticado');
        setUser(null);
        setCartItems({});
      }
    } catch (error) {
      console.log('🚨 Erro na verificação de autenticação:', error.message);

      // Se for erro 401, já foi tratado pelo interceptor
      if (error.response?.status !== 401) {
        console.error('Erro inesperado na verificação de auth:', error);
      }

      // Em caso de erro, assumir que não há usuário logado
      setUser(null);
      setCartItems({});
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
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  // Add Product to Cart
  const addToCart = itemId => {
    if (!user) {
      toast.error('Faça login para adicionar itens ao carrinho');
      setShowUserLogin(true);
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success('Adicionado ao carrinho');
  };

  // Update Cart Item Quantity
  const updateCartItem = (itemId, quantity) => {
    if (!user) {
      toast.error('Faça login para atualizar o carrinho');
      return;
    }

    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success('Carrinho atualizado');
  };

  // Remove Product from Cart
  const removeFromCart = itemId => {
    if (!user) {
      toast.error('Faça login para remover itens do carrinho');
      return;
    }

    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    toast.success('Removido do carrinho');
    setCartItems(cartData);
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

  // Clear Search Query
  const clearSearchQuery = () => {
    setSearchQuery('');
  };

  // Verificar autenticação quando a aba ganha foco
  useEffect(() => {
    const handleFocus = () => {
      console.log('👁️ Aba ganhou foco, verificando autenticação');
      fetchUser();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Página ficou visível, verificando autenticação');
        fetchUser();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Verificação inicial de autenticação
  useEffect(() => {
    console.log('🚀 Inicializando aplicação...');
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  // Update Database Cart Items
  useEffect(() => {
    const updateCart = async () => {
      if (!user) {
        console.log('👤 Usuário não logado, não atualizando carrinho');
        return;
      }

      try {
        console.log('🛒 Atualizando carrinho no servidor...');
        const { data } = await axios.post('/api/cart/update', { cartItems });
        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        console.log('Erro ao atualizar carrinho:', error.message);
        // Se receber erro 401, não mostrar toast de erro (já tratado pelo interceptor)
        if (error.response?.status !== 401) {
          toast.error('Erro ao atualizar carrinho');
        }
      }
    };

    // Só atualizar se houver usuário e carrinho não estiver vazio
    if (user && Object.keys(cartItems).length >= 0) {
      updateCart();
    }
  }, [cartItems, user]);

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
    fetchUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
