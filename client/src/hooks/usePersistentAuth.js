import { useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

const usePersistentAuth = () => {
  const {
    user,
    setUser,
    cartItems,
    setCartItems,
    axios,
    setAuthToken,
    saveUserToStorage,
    saveCartToStorage,
    loadUserFromStorage,
    loadCartFromStorage,
    clearStoredData,
  } = useAppContext();

  // Function to sync cart with server
  const syncCartWithServer = useCallback(
    async cartData => {
      if (!user || !cartData) return;

      try {
        await axios.post('/api/cart/update', { cartItems: cartData });
      } catch (error) {
        console.error('Failed to sync cart with server:', error);
      }
    },
    [user, axios]
  );

  // Function to merge local and server data
  const mergeUserData = useCallback(
    async serverUser => {
      const localCart = loadCartFromStorage();
      const serverCart = serverUser.cartItems || {};

      // Merge carts - local cart items take precedence
      const mergedCart = { ...serverCart };

      // Add local cart items, keeping higher quantities
      Object.keys(localCart).forEach(itemId => {
        if (mergedCart[itemId]) {
          mergedCart[itemId] = Math.max(mergedCart[itemId], localCart[itemId]);
        } else {
          mergedCart[itemId] = localCart[itemId];
        }
      });

      // Update state
      setCartItems(mergedCart);
      saveCartToStorage(mergedCart);

      // Sync with server if there are differences
      if (JSON.stringify(mergedCart) !== JSON.stringify(serverCart)) {
        await syncCartWithServer(mergedCart);
      }

      return mergedCart;
    },
    [loadCartFromStorage, setCartItems, saveCartToStorage, syncCartWithServer]
  );

  // Function to handle authentication success
  const handleAuthSuccess = useCallback(
    async (userData, token) => {
      // Set user and token
      setUser(userData);
      if (token) {
        setAuthToken(token);
      }

      // Save user data
      saveUserToStorage(userData);

      // Merge and sync cart data
      await mergeUserData(userData);
    },
    [setUser, setAuthToken, saveUserToStorage, mergeUserData]
  );

  // Function to handle authentication failure
  const handleAuthFailure = useCallback(() => {
    // Keep cart data but clear user data
    const savedCart = loadCartFromStorage();
    setUser(null);
    setCartItems(savedCart);

    // Clear only auth-related data, keep cart
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
  }, [setUser, setCartItems, loadCartFromStorage, axios]);

  // Function to restore session from localStorage
  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    const savedUser = loadUserFromStorage();
    const savedCart = loadCartFromStorage();

    // Set cart immediately from localStorage
    setCartItems(savedCart);

    if (token && savedUser) {
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        // Verify token with server
        const response = await axios.get('/api/user/is-auth');

        if (response.data.success) {
          await handleAuthSuccess(response.data.user, token);
        } else {
          handleAuthFailure();
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        handleAuthFailure();
      }
    } else if (savedUser) {
      // Partial session - try to restore
      setUser(savedUser);
    }
  }, [
    axios,
    loadUserFromStorage,
    loadCartFromStorage,
    setCartItems,
    handleAuthSuccess,
    handleAuthFailure,
  ]);

  // Auto-save cart changes to localStorage
  useEffect(() => {
    if (cartItems && Object.keys(cartItems).length >= 0) {
      saveCartToStorage(cartItems);
    }
  }, [cartItems, saveCartToStorage]);

  // Auto-sync cart with server when user is available
  useEffect(() => {
    if (user && cartItems && Object.keys(cartItems).length > 0) {
      const timeoutId = setTimeout(() => {
        syncCartWithServer(cartItems);
      }, 1000); // Debounce sync calls

      return () => clearTimeout(timeoutId);
    }
  }, [user, cartItems, syncCartWithServer]);

  return {
    handleAuthSuccess,
    handleAuthFailure,
    restoreSession,
    syncCartWithServer,
    mergeUserData,
  };
};

export default usePersistentAuth;
