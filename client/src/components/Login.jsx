import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { setShowUserLogin, setUser, axios, navigate, isMobile } =
    useAppContext();
  const [state, setState] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Detect iOS on component mount
  useEffect(() => {
    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    return () => {
      setName('');
      setEmail('');
      setPassword('');
    };
  }, []);

  const onSubmitHandler = async event => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post(`/api/user/${state}`, {
        name,
        email,
        password,
      });

      if (data.success) {
        handleSuccessfulAuth(data);
      } else {
        toast.error(data.message || 'Authentication failed');
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulAuth = data => {
    setUser(data.user);
    setShowUserLogin(false);
    navigate('/');
    toast.success(`Welcome back, ${data.user.name || 'User'}!`);

    // Enhanced mobile token handling
    if (isMobile && data.token) {
      localStorage.setItem('mobile_auth_token', data.token);

      // For iOS, also store in sessionStorage as fallback
      if (isIOS) {
        sessionStorage.setItem('temp_auth_token', data.token);
      }
    }
  };

  const handleAuthError = error => {
    console.error('Login error:', error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to connect to server';
    toast.error(errorMessage);

    // Clear all auth tokens on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('mobile_auth_token');
      if (isIOS) {
        sessionStorage.removeItem('temp_auth_token');
      }
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={e => e.stopPropagation()}
        className='relative flex flex-col gap-4 w-full max-w-md mx-4 p-8 rounded-lg shadow-xl border border-gray-200 bg-white'
      >
        <button
          type='button'
          onClick={() => setShowUserLogin(false)}
          className='absolute top-4 right-4 text-gray-500 hover:text-gray-700'
          aria-label='Close login'
        >
          ✕
        </button>

        <h2 className='text-2xl font-medium text-center mb-4'>
          <span className='text-primary'>User</span>{' '}
          {state === 'login' ? 'Login' : 'Sign Up'}
        </h2>

        {state === 'register' && (
          <div className='w-full'>
            <label htmlFor='name' className='block mb-1'>
              Name
            </label>
            <input
              id='name'
              onChange={e => setName(e.target.value)}
              value={name}
              placeholder='Type your name'
              className='w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary'
              type='text'
              required
              autoComplete='name'
              autoCapitalize='words'
            />
          </div>
        )}

        <div className='w-full'>
          <label htmlFor='email' className='block mb-1'>
            Email
          </label>
          <input
            id='email'
            onChange={e => setEmail(e.target.value)}
            value={email}
            placeholder='Type your email'
            className='w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary'
            type='email'
            inputMode='email'
            required
            autoComplete='email'
          />
        </div>

        <div className='w-full'>
          <label htmlFor='password' className='block mb-1'>
            Password
          </label>
          <input
            id='password'
            onChange={e => setPassword(e.target.value)}
            value={password}
            placeholder='Type your password'
            className='w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary'
            type='password'
            required
            minLength={6}
            autoComplete={
              state === 'login' ? 'current-password' : 'new-password'
            }
          />
        </div>

        <div className='text-center mt-2'>
          {state === 'register' ? (
            <p>
              Already have an account?{' '}
              <button
                type='button'
                onClick={() => setState('login')}
                className='text-primary hover:underline focus:outline-none'
              >
                Login here
              </button>
            </p>
          ) : (
            <p>
              Need an account?{' '}
              <button
                type='button'
                onClick={() => setState('register')}
                className='text-primary hover:underline focus:outline-none'
              >
                Register here
              </button>
            </p>
          )}
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            isLoading
              ? 'bg-primary-dull cursor-wait'
              : 'bg-primary hover:bg-primary-dull'
          } transition-colors`}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className='inline-flex items-center justify-center'>
              Processing...
            </span>
          ) : state === 'register' ? (
            'Create Account'
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
