import React from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {
  const {
    setShowUserLogin,
    setUser,
    axios,
    navigate,
    setAuthToken,
    setCartItems,
    saveCartToStorage,
    loadCartFromStorage,
    saveUserToStorage,
  } = useAppContext();

  const [state, setState] = React.useState('login');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmitHandler = async event => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await axios.post(`/api/user/${state}`, {
        name,
        email,
        password,
      });

      if (data.success) {
        // ✅ 1. FECHAR MODAL IMEDIATAMENTE
        setShowUserLogin(false);

        // ✅ 2. Set user data
        setUser(data.user);

        // ✅ 3. Store token for persistence
        if (data.token) {
          setAuthToken(data.token);
        }

        // ✅ 4. Save user data to localStorage
        saveUserToStorage(data.user);

        // ✅ 5. Merge server cart with local cart
        const localCart = loadCartFromStorage();
        const serverCart = data.user.cartItems || {};
        const mergedCart = { ...serverCart, ...localCart };
        setCartItems(mergedCart);
        saveCartToStorage(mergedCart);

        // ✅ 6. Sync merged cart with server
        if (Object.keys(mergedCart).length > 0) {
          try {
            await axios.post('/api/cart/update', { cartItems: mergedCart });
          } catch (error) {
            console.error('Error syncing cart:', error);
          }
        }

        // ✅ 7. MENSAGEM DE BOAS-VINDAS PERSONALIZADA
        const userName = data.user.name.split(' ')[0]; // Primeiro nome apenas

        if (state === 'login') {
          toast.success(`🎉 Bem-vindo de volta, ${userName}!`, {
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '500',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          });
        } else {
          toast.success(
            `🎊 Conta criada com sucesso! Bem-vindo, ${userName}!`,
            {
              duration: 5000,
              style: {
                background: '#3B82F6',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '500',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#3B82F6',
              },
            }
          );
        }

        // ✅ 8. Clear form
        setName('');
        setEmail('');
        setPassword('');

        // ✅ 9. Navegar após um pequeno delay (opcional)
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Algo deu errado. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className='fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50'
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={e => e.stopPropagation()}
        className='flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white'
      >
        <p className='text-2xl font-medium m-auto'>
          <span className='text-primary'>User</span>{' '}
          {state === 'login' ? 'Login' : 'Sign Up'}
        </p>

        {state === 'register' && (
          <div className='w-full'>
            <p>Nome</p>
            <input
              onChange={e => setName(e.target.value)}
              value={name}
              placeholder='Digite seu nome'
              className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary'
              type='text'
              required
              disabled={isSubmitting}
            />
          </div>
        )}

        <div className='w-full '>
          <p>Email</p>
          <input
            onChange={e => setEmail(e.target.value)}
            value={email}
            placeholder='Digite seu email'
            className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary'
            type='email'
            required
            disabled={isSubmitting}
          />
        </div>

        <div className='w-full '>
          <p>Password</p>
          <input
            onChange={e => setPassword(e.target.value)}
            value={password}
            placeholder='Digite sua senha'
            className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary'
            type='password'
            required
            disabled={isSubmitting}
          />
        </div>

        {state === 'register' ? (
          <p>
            Já tem uma conta?{' '}
            <span
              onClick={() => !isSubmitting && setState('login')}
              className={`text-primary ${
                isSubmitting ? 'opacity-50' : 'cursor-pointer hover:underline'
              }`}
            >
              Fazer login
            </span>
          </p>
        ) : (
          <p>
            Criar uma conta?{' '}
            <span
              onClick={() => !isSubmitting && setState('register')}
              className={`text-primary ${
                isSubmitting ? 'opacity-50' : 'cursor-pointer hover:underline'
              }`}
            >
              Cadastrar-se
            </span>
          </p>
        )}

        <button
          type='submit'
          disabled={isSubmitting}
          className={`bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting
            ? state === 'register'
              ? 'Criando conta...'
              : 'Entrando...'
            : state === 'register'
            ? 'Criar Conta'
            : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
