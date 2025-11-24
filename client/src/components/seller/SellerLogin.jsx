import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Eye, EyeOff, Lock, Mail, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate, axios } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (isSeller) {
      navigate('/seller');
    }
  }, [isSeller, navigate]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('seller_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const onSubmitHandler = async event => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post('/api/seller/login', {
        email,
        password,
      });

      if (data.success) {
        if (rememberMe) {
          localStorage.setItem('seller_email', email);
        } else {
          localStorage.removeItem('seller_email');
        }

        // ✅ CRÍTICO: Marcar que acabou de fazer login
        sessionStorage.setItem('seller_just_logged_in', 'true');

        setIsSeller(true);
        toast.success('Login realizado com sucesso!', {
          icon: '🔓',
          duration: 2000,
        });
        navigate('/seller');
      } else {
        toast.error(data.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao fazer login. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (isSeller) return null;

  return (
    <div className='min-h-screen flex'>
      {/* Lado Esquerdo - Branding */}
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl'></div>
          <div className='absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl'></div>
        </div>

        <div className='relative z-10 flex flex-col justify-between p-12 text-white w-full'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm'>
              <Shield className='w-7 h-7 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold'>Elite Surfing</h1>
              <p className='text-white/70 text-sm'>Painel Administrativo</p>
            </div>
          </div>

          <div className='space-y-6'>
            <h2 className='text-4xl font-bold leading-tight'>
              Gerencie sua loja<br />
              <span className='text-white/80'>de forma simples</span>
            </h2>
            <p className='text-white/70 text-lg max-w-md'>
              Acesse o painel administrativo para gerenciar produtos, pedidos e
              acompanhar o desempenho da sua loja.
            </p>
          </div>

          <div className='text-white/50 text-sm'>
            <p>© 2025 Elite Surfing. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50'>
        <div className={`w-full max-w-md transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <button
            onClick={handleGoBack}
            className='flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors group'
          >
            <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
            <span className='text-sm'>Voltar à loja</span>
          </button>

          <div className='bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 sm:p-10 border border-gray-100'>
            <div className='text-center mb-8'>
              <div className='lg:hidden flex justify-center mb-6'>
                <div className='w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center'>
                  <Shield className='w-8 h-8 text-primary' />
                </div>
              </div>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>
                Bem-vindo de volta
              </h1>
              <p className='text-gray-500'>
                Faça login para acessar o painel administrativo
              </p>
            </div>

            <form onSubmit={onSubmitHandler} className='space-y-6'>
              <div className='space-y-2'>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                  Email
                </label>
                <div className='relative'>
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    focusedField === 'email' ? 'text-primary' : 'text-gray-400'
                  }`}>
                    <Mail className='w-5 h-5' />
                  </div>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder='admin@elitesurfing.pt'
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 ${
                      focusedField === 'email'
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                    required
                    disabled={isLoading}
                    autoComplete='email'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                  Password
                </label>
                <div className='relative'>
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    focusedField === 'password' ? 'text-primary' : 'text-gray-400'
                  }`}>
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
                    disabled={isLoading}
                    autoComplete='current-password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
              </div>

              <div className='flex items-center'>
                <label className='flex items-center gap-2 cursor-pointer group'>
                  <input
                    type='checkbox'
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className='w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary'
                    disabled={isLoading}
                  />
                  <span className='text-sm text-gray-600 group-hover:text-gray-800'>
                    Lembrar-me
                  </span>
                </label>
              </div>

              <button
                type='submit'
                disabled={isLoading || !email || !password}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  isLoading || !email || !password
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    <span>A entrar...</span>
                  </>
                ) : (
                  <>
                    <Lock className='w-5 h-5' />
                    <span>Entrar no Painel</span>
                  </>
                )}
              </button>
            </form>

            <div className='mt-8 bg-gray-50 rounded-xl p-4 border border-gray-100'>
              <div className='flex items-start gap-3'>
                <Shield className='w-5 h-5 text-primary mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-gray-800'>Área Segura</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    Esta área é restrita a administradores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;