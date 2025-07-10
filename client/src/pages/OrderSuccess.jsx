import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { currency, user } = useAppContext();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Redirect after 8 seconds
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/my-orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleViewOrders = () => {
    navigate('/my-orders');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <div className='min-h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 py-8'>
      <div className='max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center'>
        {/* Success Icon */}
        <div className='mb-6'>
          <div className='mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4'>
            <svg
              className='w-12 h-12 text-green-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
            Encomenda Efetuada com Sucesso!
          </h1>
          <div className='w-24 h-1 bg-green-500 mx-auto rounded-full'></div>
        </div>

        {/* Thank You Message */}
        <div className='mb-8'>
          <p className='text-lg text-gray-600 mb-4'>
            Olá{' '}
            <span className='font-semibold text-primary-dark'>
              {user?.name || 'Cliente'}
            </span>
            ,
          </p>
          <p className='text-gray-700 mb-4'>
            Muito obrigado pela sua compra! A sua encomenda foi processada com
            sucesso e está a ser preparada para envio.
          </p>

          {orderId && (
            <div className='bg-gray-50 rounded-lg p-4 mb-6'>
              <p className='text-sm text-gray-600 mb-1'>Número da Encomenda:</p>
              <p className='text-lg font-mono font-semibold text-gray-800 break-all'>
                #{orderId}
              </p>
            </div>
          )}

          <div className='bg-blue-50 rounded-lg p-6 mb-6'>
            <div className='flex items-center justify-center mb-3'>
              <svg
                className='w-8 h-8 text-blue-600 mr-2 flex-shrink-0'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
              </svg>
              <h3 className='text-lg font-semibold text-blue-800'>
                Email de Confirmação
              </h3>
            </div>
            <p className='text-blue-700 mb-2'>
              Um email com todos os detalhes da sua encomenda será enviado para{' '}
              <span className='font-semibold break-all'>
                {user?.email || 'o seu email'}
              </span>{' '}
              em breve.
            </p>
            <p className='text-sm text-blue-600'>
              Por favor, verifique também a pasta de spam/lixo eletrônico.
            </p>
          </div>

          {/* Countdown */}
          <div className='text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-lg'>
            <p className='mb-1'>Será redirecionado automaticamente para:</p>
            <p className='font-semibold'>
              <span className='text-primary-dark'>"As Minhas Encomendas"</span>{' '}
              em{' '}
              <span className='font-bold text-primary-dark text-lg'>
                {countdown}
              </span>{' '}
              segundo{countdown !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          <button
            onClick={handleViewOrders}
            className='px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dull transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-base'
          >
            Ver as Minhas Encomendas
          </button>
          <button
            onClick={() => navigate('/write-review')}
            className='px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-base'
          >
            Escrever Review
          </button>
          <button
            onClick={handleContinueShopping}
            className='px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 active:scale-95 text-base'
          >
            Continuar a Comprar
          </button>
        </div>

        {/* Additional Info */}
        <div className='pt-6 border-t border-gray-200'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
            <div className='flex items-center justify-center p-3 bg-green-50 rounded-lg'>
              <svg
                className='w-5 h-5 mr-2 text-green-500 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <span className='font-medium'>Pagamento Seguro</span>
            </div>
            <div className='flex items-center justify-center p-3 bg-blue-50 rounded-lg'>
              <svg
                className='w-5 h-5 mr-2 text-blue-500 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
              </svg>
              <span className='font-medium'>Entrega Rápida</span>
            </div>
            <div className='flex items-center justify-center p-3 bg-purple-50 rounded-lg'>
              <svg
                className='w-5 h-5 mr-2 text-purple-500 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='font-medium'>Suporte 24/7</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
            <p className='text-sm text-gray-600 mb-2'>
              <span className='font-semibold'>Tem alguma questão?</span>
            </p>
            <p className='text-sm text-gray-600'>
              Contacte-nos:{' '}
              <a
                href='mailto:suporte@elitesurfing.pt'
                className='text-primary-dark hover:text-primary font-medium transition-colors duration-200'
              >
                suporte@elitesurfing.pt
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
