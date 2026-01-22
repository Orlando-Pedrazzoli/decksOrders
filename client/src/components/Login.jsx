import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  X,
  Loader2,
  ShoppingBag,
  Heart,
  Truck,
  Star,
} from 'lucide-react';
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
    saveUserToStorage,
    // ✅ REMOVIDO: loadCartFromStorage - não precisamos mais
  } = useAppContext();

  const [state, setState] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Animação de entrada
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay para animação
    setTimeout(() => setIsVisible(true), 50);

    // Carregar email salvo
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Bloquear scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Reset form quando muda de estado
  useEffect(() => {
    setPassword('');
    setShowPassword(false);
    setAcceptTerms(false);
  }, [state]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setShowUserLogin(false), 200);
  };

  const onSubmitHandler = async event => {
    event.preventDefault();

    if (state === 'register' && !acceptTerms) {
      toast.error('Aceite os termos e condições para continuar');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await axios.post(`/api/user/${state}`, {
        name,
        email,
        password,
      });

      if (data.success) {
        // Salvar email se "Lembrar-me" estiver marcado
        if (rememberMe) {
          localStorage.setItem('user_email', email);
        } else {
          localStorage.removeItem('user_email');
        }

        // Fechar modal
        handleClose();

        // Set user data
        setUser(data.user);

        // Store token for persistence
        if (data.token) {
          setAuthToken(data.token);
        }

        // Save user data to localStorage
        saveUserToStorage(data.user);

        // ✅ CORREÇÃO: Usar APENAS os cartItems do servidor
        // O servidor já tem o carrinho do usuário salvo no banco de dados
        // Não fazer merge com localStorage (que está vazio após logout)
        const serverCart = data.user.cartItems || {};
        
        // Atualizar estado e localStorage com os dados do servidor
        setCartItems(serverCart);
        saveCartToStorage(serverCart);
        
        console.log('🛒 Carrinho restaurado do servidor:', Object.keys(serverCart).length, 'itens');

        // Mensagem de boas-vindas personalizada
        const userName = data.user.name.split(' ')[0];

        if (state === 'login') {
          toast.success(`Bem-vindo de volta, ${userName}!`, {
            icon: '👋',
            duration: 3000,
          });
        } else {
          toast.success(`Conta criada com sucesso! Bem-vindo, ${userName}!`, {
            icon: '🎉',
            duration: 4000,
          });
        }

        // Clear form
        setName('');
        setEmail('');
        setPassword('');
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

  const benefits = [
    {
      icon: ShoppingBag,
      title: 'Compras Rápidas',
      description: 'Checkout simplificado',
    },
    {
      icon: Truck,
      title: 'Rastrear Pedidos',
      description: 'Acompanhe suas entregas',
    },
    {
      icon: Heart,
      title: 'Lista de Desejos',
      description: 'Salve seus favoritos',
    },
    {
      icon: Star,
      title: 'Avaliações',
      description: 'Compartilhe experiências',
    },
  ];

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`relative w-full max-w-4xl max-h-[95vh] overflow-hidden bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Botão Fechar */}
        <button
          onClick={handleClose}
          className='absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200'
        >
          <X className='w-5 h-5' />
        </button>

        <div className='flex flex-col md:flex-row'>
          {/* Lado Esquerdo - Branding (hidden on mobile) */}
          <div className='hidden md:flex md:w-5/12 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden'>
            {/* Padrões decorativos */}
            <div className='absolute inset-0 opacity-10'>
              <div className='absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl'></div>
              <div className='absolute bottom-10 right-10 w-56 h-56 bg-white rounded-full blur-3xl'></div>
            </div>

            {/* Conteúdo */}
            <div className='relative z-10 flex flex-col justify-between p-8 text-white w-full'>
              {/* Header com Logo */}
              <div>
                <div className='flex items-center gap-3 mb-6'>
                  {/* 🆕 Logo da loja */}
                  <div className='w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg'>
                    <img 
                      src='/logo.png' 
                      alt='Elite Surfing Logo' 
                      className='w-10 h-10 object-contain'
                    />
                  </div>
                  <div>
                    <h1 className='text-xl font-bold'>Elite Surfing</h1>
                    <p className='text-white/70 text-xs'>Surf Shop Premium</p>
                  </div>
                </div>
              </div>

              {/* Benefícios */}
              <div className='space-y-4'>
                <h2 className='text-2xl font-bold leading-tight'>
                  {state === 'login' ? 'Bem-vindo de volta!' : 'Junte-se a nós!'}
                </h2>
                <p className='text-white/80 text-sm'>
                  {state === 'login'
                    ? 'Entre na sua conta para continuar sua jornada de surf.'
                    : 'Crie sua conta e aproveite benefícios exclusivos.'}
                </p>

                {/* Features grid */}
                <div className='grid grid-cols-2 gap-3 pt-4'>
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className='bg-white/10 rounded-xl p-3 backdrop-blur-sm hover:bg-white/20 transition-colors'
                    >
                      <benefit.icon className='w-5 h-5 mb-2 text-white/90' />
                      <p className='text-sm font-medium'>{benefit.title}</p>
                      <p className='text-xs text-white/60'>
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer com Logo pequeno */}
              <div className='flex items-center gap-2 text-white/50 text-xs'>
                <img 
                  src='/logo.png' 
                  alt='Elite Surfing' 
                  className='w-4 h-4 object-contain opacity-50'
                />
                <p>© 2025 Elite Surfing Portugal</p>
              </div>
            </div>
          </div>

          {/* Lado Direito - Formulário */}
          <div className='w-full md:w-7/12 p-6 sm:p-8 md:p-10 overflow-y-auto max-h-[95vh] md:max-h-none'>
            {/* Header Mobile com Logo */}
            <div className='md:hidden text-center mb-6'>
              {/* 🆕 Logo para mobile */}
              <div className='inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 shadow-sm'>
                <img 
                  src='/logo.png' 
                  alt='Elite Surfing Logo' 
                  className='w-10 h-10 object-contain'
                />
              </div>
              <h1 className='text-xl font-bold text-gray-900'>Elite Surfing</h1>
              <p className='text-sm text-gray-500'>Surf Shop Premium</p>
            </div>

            {/* Tabs */}
            <div className='flex bg-gray-100 rounded-xl p-1 mb-8'>
              <button
                type='button'
                onClick={() => !isSubmitting && setState('login')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  state === 'login'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                disabled={isSubmitting}
              >
                Entrar
              </button>
              <button
                type='button'
                onClick={() => !isSubmitting && setState('register')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  state === 'register'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                disabled={isSubmitting}
              >
                Criar Conta
              </button>
            </div>

            {/* Título */}
            <div className='mb-6'>
              <h2 className='text-2xl font-bold text-gray-900'>
                {state === 'login' ? 'Bem-vindo de volta' : 'Criar nova conta'}
              </h2>
              <p className='text-gray-500 mt-1'>
                {state === 'login'
                  ? 'Entre com suas credenciais para continuar'
                  : 'Preencha os dados abaixo para se registar'}
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={onSubmitHandler} className='space-y-5'>
              {/* Campo Nome (apenas register) */}
              {state === 'register' && (
                <div className='space-y-2'>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Nome completo
                  </label>
                  <div className='relative'>
                    <div
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                        focusedField === 'name'
                          ? 'text-primary'
                          : 'text-gray-400'
                      }`}
                    >
                      <User className='w-5 h-5' />
                    </div>
                    <input
                      id='name'
                      type='text'
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder='João Silva'
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 ${
                        focusedField === 'name'
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                      required
                      disabled={isSubmitting}
                      autoComplete='name'
                    />
                  </div>
                </div>
              )}

              {/* Campo Email */}
              <div className='space-y-2'>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700'
                >
                  Email
                </label>
                <div className='relative'>
                  <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'email' ? 'text-primary' : 'text-gray-400'
                    }`}
                  >
                    <Mail className='w-5 h-5' />
                  </div>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder='seu@email.com'
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 ${
                      focusedField === 'email'
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                    required
                    disabled={isSubmitting}
                    autoComplete='email'
                  />
                </div>
              </div>

              {/* Campo Password */}
              <div className='space-y-2'>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700'
                >
                  Password
                </label>
                <div className='relative'>
                  <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'password'
                        ? 'text-primary'
                        : 'text-gray-400'
                    }`}
                  >
                    <Lock className='w-5 h-5' />
                  </div>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder='••••••••'
                    className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 ${
                      focusedField === 'password'
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                    required
                    disabled={isSubmitting}
                    autoComplete={
                      state === 'login' ? 'current-password' : 'new-password'
                    }
                    minLength={state === 'register' ? 6 : undefined}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className='w-5 h-5' />
                    ) : (
                      <Eye className='w-5 h-5' />
                    )}
                  </button>
                </div>
                {state === 'register' && (
                  <p className='text-xs text-gray-500 mt-1'>
                    Mínimo de 6 caracteres
                  </p>
                )}
              </div>

              {/* Opções extras */}
              {state === 'login' ? (
                <div className='flex items-center justify-between'>
                  <label className='flex items-center gap-2 cursor-pointer group'>
                    <div className='relative'>
                      <input
                        type='checkbox'
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className='sr-only peer'
                        disabled={isSubmitting}
                      />
                      <div className='w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 flex items-center justify-center'>
                        {rememberMe && (
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className='text-sm text-gray-600 group-hover:text-gray-800 transition-colors'>
                      Lembrar-me
                    </span>
                  </label>
                </div>
              ) : (
                <div className='space-y-3'>
                  <label className='flex items-start gap-3 cursor-pointer group'>
                    <div className='relative mt-0.5'>
                      <input
                        type='checkbox'
                        checked={acceptTerms}
                        onChange={e => setAcceptTerms(e.target.checked)}
                        className='sr-only peer'
                        disabled={isSubmitting}
                      />
                      <div className='w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 flex items-center justify-center'>
                        {acceptTerms && (
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className='text-sm text-gray-600 group-hover:text-gray-800 transition-colors'>
                      Aceito os{' '}
                      <a
                        href='/terms'
                        className='text-primary hover:underline'
                        onClick={e => e.stopPropagation()}
                      >
                        Termos de Serviço
                      </a>{' '}
                      e a{' '}
                      <a
                        href='/privacy'
                        className='text-primary hover:underline'
                        onClick={e => e.stopPropagation()}
                      >
                        Política de Privacidade
                      </a>
                    </span>
                  </label>
                </div>
              )}

              {/* Botão Submit */}
              <button
                type='submit'
                disabled={
                  isSubmitting ||
                  !email ||
                  !password ||
                  (state === 'register' && (!name || !acceptTerms))
                }
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  isSubmitting ||
                  !email ||
                  !password ||
                  (state === 'register' && (!name || !acceptTerms))
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    <span>
                      {state === 'login' ? 'A entrar...' : 'A criar conta...'}
                    </span>
                  </>
                ) : (
                  <>
                    {state === 'login' ? (
                      <>
                        <Lock className='w-5 h-5' />
                        <span>Entrar</span>
                      </>
                    ) : (
                      <>
                        <User className='w-5 h-5' />
                        <span>Criar Conta</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className='relative my-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-200'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-4 bg-white text-gray-500'>
                  {state === 'login'
                    ? 'Novo por aqui?'
                    : 'Já tem uma conta?'}
                </span>
              </div>
            </div>

            {/* Link alternativo */}
            <button
              type='button'
              onClick={() =>
                !isSubmitting &&
                setState(state === 'login' ? 'register' : 'login')
              }
              disabled={isSubmitting}
              className='w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-primary hover:text-primary transition-all duration-200 disabled:opacity-50'
            >
              {state === 'login' ? 'Criar nova conta' : 'Entrar na minha conta'}
            </button>

            {/* Segurança */}
            <div className='mt-6 flex items-center justify-center gap-2 text-xs text-gray-400'>
              <Lock className='w-3 h-3' />
              <span>Conexão segura e encriptada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;