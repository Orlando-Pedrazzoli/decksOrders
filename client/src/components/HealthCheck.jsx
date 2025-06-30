import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const HealthCheck = () => {
  const { axios, user } = useAppContext();
  const [status, setStatus] = useState({
    server: 'checking',
    auth: 'checking',
    cart: 'checking',
    localStorage: 'checking',
  });

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    // Check server connection
    try {
      const response = await axios.get('/');
      setStatus(prev => ({
        ...prev,
        server: response.status === 200 ? 'ok' : 'error',
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, server: 'error' }));
    }

    // Check authentication
    try {
      const authResponse = await axios.get('/api/user/is-auth');
      setStatus(prev => ({
        ...prev,
        auth: authResponse.data.success ? 'ok' : 'error',
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, auth: 'error' }));
    }

    // Check localStorage
    try {
      const testKey = 'health_check_test';
      localStorage.setItem(testKey, 'test');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      setStatus(prev => ({
        ...prev,
        localStorage: retrieved === 'test' ? 'ok' : 'error',
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, localStorage: 'error' }));
    }

    // Check cart functionality
    try {
      const cartData = localStorage.getItem('cart_items');
      setStatus(prev => ({
        ...prev,
        cart: cartData !== null ? 'ok' : 'warning',
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, cart: 'error' }));
    }
  };

  const getStatusIcon = statusValue => {
    switch (statusValue) {
      case 'ok':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '🔄';
    }
  };

  const getStatusColor = statusValue => {
    switch (statusValue) {
      case 'ok':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className='fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-xs'>
      <h3 className='font-bold text-sm mb-2'>Sistema Status</h3>

      <div className='space-y-1 text-xs'>
        <div className='flex justify-between'>
          <span>Servidor:</span>
          <span className={getStatusColor(status.server)}>
            {getStatusIcon(status.server)} {status.server}
          </span>
        </div>

        <div className='flex justify-between'>
          <span>Autenticação:</span>
          <span className={getStatusColor(status.auth)}>
            {getStatusIcon(status.auth)} {status.auth}
          </span>
        </div>

        <div className='flex justify-between'>
          <span>LocalStorage:</span>
          <span className={getStatusColor(status.localStorage)}>
            {getStatusIcon(status.localStorage)} {status.localStorage}
          </span>
        </div>

        <div className='flex justify-between'>
          <span>Carrinho:</span>
          <span className={getStatusColor(status.cart)}>
            {getStatusIcon(status.cart)} {status.cart}
          </span>
        </div>

        <div className='border-t pt-1 mt-2'>
          <div className='flex justify-between'>
            <span>Usuário:</span>
            <span className={user ? 'text-green-600' : 'text-gray-600'}>
              {user ? '✅ Logado' : '👤 Visitante'}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={checkHealth}
        className='mt-2 text-xs bg-primary text-white px-2 py-1 rounded w-full'
      >
        Verificar Novamente
      </button>
    </div>
  );
};

export default HealthCheck;
