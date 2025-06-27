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
        if (error.response?.status === 401) {
          // Se receber 401, limpar o estado do usuário
          console.log('401 recebido, limpando estado do usuário');
          setUser(null);
          setCartItems({});
          // Redirecionar para home se não estiver lá
          if (window.location.pathname !== '/') {
            navigate('/');
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
      setIsSeller(false);
    }
  };

  // Fetch User Auth Status , User Data and Cart Items
  const fetchUser = async () => {
    try {
      // Verificar se o usuário fez logout recentemente
      if (sessionStorage.getItem('userLoggedOut') === 'true') {
        console.log('Usuário fez logout recentemente, limpando estado');
        sessionStorage.removeItem('userLoggedOut');
        setUser(null);
        setCartItems({});
        return;
      }

      const { data } = await axios.get('api/user/is-auth');
      if (data.success && data.user) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        // Se não há usuário autenticado, garantir que o estado está limpo
        setUser(null);
        setCartItems({});
      }
    } catch (error) {
      console.error('Auth check error:', error);
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
      toast.error(error.message);
    }
  };

  // Add Product to Cart
  const addToCart = itemId => {
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success('Added to Cart');
  };

  // Update Cart Item Quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success('Cart Updated');
  };

  // Remove Product from Cart
  const removeFromCart = itemId => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    toast.success('Removed from Cart');
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
      if (cartItems[items] > 0) {
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
      console.log('Aba ganhou foco, verificando autenticação');
      fetchUser();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Página ficou visível, verificando autenticação');
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

  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  // Update Database Cart Items
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post('/api/cart/update', { cartItems });
        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        // Se receber erro 401, não mostrar toast de erro
        if (error.response?.status !== 401) {
          toast.error(error.message);
        }
      }
    };

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
    fetchUser, // Adicionar fetchUser ao contexto para poder ser chamado externamente
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
