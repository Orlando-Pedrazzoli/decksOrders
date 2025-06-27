import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [localSearchInput, setLocalSearchInput] = useState('');

  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    setSearchQuery,
    searchQuery,
    getCartCount,
    axios,
    setCartItems,
  } = useAppContext();

  // Sync with global search query
  useEffect(() => {
    if (typeof searchQuery === 'string') {
      setLocalSearchInput(searchQuery);
    }
  }, [searchQuery]);

  // Navigate to products when search query changes
  useEffect(() => {
    if (searchQuery && searchQuery.length > 0) {
      navigate('/products');
    }
  }, [searchQuery, navigate]);

  const logout = async () => {
    try {
      const { data } = await axios.get('/api/user/logout');
      if (data.success) {
        // Limpar todos os dados do usuário imediatamente
        setUser(null);
        setCartItems({});

        // Marcar logout no sessionStorage para controle adicional
        sessionStorage.setItem('userLoggedOut', 'true');

        // Limpar qualquer cache do axios
        delete axios.defaults.headers.common['Authorization'];

        toast.success(data.message);
        navigate('/', { replace: true }); // Use replace para evitar voltar ao estado anterior
        setOpen(false);

        // Forçar reload para garantir limpeza total do estado
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Mesmo se houver erro, limpe o estado local
      setUser(null);
      setCartItems({});
      sessionStorage.setItem('userLoggedOut', 'true');
      navigate('/', { replace: true });
      toast.error('Erro ao fazer logout');

      // Reload mesmo em caso de erro
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const handleSearch = e => {
    const value = e.target.value;
    setLocalSearchInput(value);
    setSearchQuery(value); // Update global search immediately
  };

  const handleNavLinkClick = path => {
    setOpen(false);
    navigate(path);
  };

  // Render search input consistently
  const renderSearchInput = (isMobile = false) => (
    <div
      className={`flex items-center gap-2 border border-gray-300 px-3 rounded-full ${
        isMobile ? 'w-full px-4 py-2' : 'text-sm py-1.5'
      }`}
    >
      <input
        onChange={handleSearch}
        value={localSearchInput}
        className={`w-full bg-transparent outline-none placeholder-gray-500 ${
          isMobile ? 'text-base' : ''
        }`}
        type='text'
        placeholder='Pesquisar produtos'
      />
      <img src={assets.search_icon} alt='search' className='w-4 h-4' />
    </div>
  );

  return (
    <nav className='flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative shadow-sm z-50'>
      <NavLink to='/' onClick={() => setOpen(false)}>
        <img className='h-9' src={assets.logo_es} alt='logo' />
      </NavLink>

      {/* Desktop Navigation */}
      <div className='hidden sm:flex items-center gap-8'>
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/products'>Produtos</NavLink>
        <NavLink to='/contact'>Contacto</NavLink>

        {/* Desktop Search */}
        <div className='hidden lg:flex items-center'>{renderSearchInput()}</div>

        {/* Desktop Cart Icon */}
        <div
          onClick={() => navigate('/cart')}
          className='relative cursor-pointer'
        >
          <img
            src={assets.nav_cart_icon}
            alt='cart'
            className='w-6 opacity-80'
          />
          <button className='absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full'>
            {getCartCount()}
          </button>
        </div>

        {/* Desktop User Login/Profile */}
        {!user ? (
          <button
            onClick={() => setShowUserLogin(true)}
            className='cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full'
          >
            Login
          </button>
        ) : (
          <div className='relative group'>
            <img src={assets.profile_icon} className='w-10' alt='profile' />
            <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-36 rounded-md text-sm z-40 transition-all duration-200'>
              <li
                onClick={() => navigate('/my-orders')}
                className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'
              >
                Os meus Pedidos
              </li>
              <li
                onClick={logout}
                className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'
              >
                Sair
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile-specific elements */}
      <div className='flex items-center gap-6 sm:hidden'>
        {/* Mobile Cart Icon */}
        <div
          onClick={() => navigate('/cart')}
          className='relative cursor-pointer'
        >
          <img
            src={assets.nav_cart_icon}
            alt='cart'
            className='w-6 opacity-80'
          />
          <button className='absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full'>
            {getCartCount()}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-label='Menu'
          className='focus:outline-none'
        >
          <img src={assets.menu_icon} alt='menu' className='w-7 h-7' />
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {open && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden transition-opacity duration-300'>
          <div className='absolute top-0 right-0 h-full w-3/4 sm:w-1/2 bg-white shadow-lg p-6 flex flex-col items-start gap-6 transition-transform duration-300 ease-out transform translate-x-0'>
            <button
              onClick={() => setOpen(false)}
              className='self-end text-gray-500 hover:text-gray-800 transition-colors duration-200'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-7 w-7'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>

            <NavLink
              to='/'
              className='block w-full text-left py-2 text-gray-700 hover:text-primary transition-colors duration-200 text-lg font-medium border-b border-gray-100'
              onClick={() => handleNavLinkClick('/')}
            >
              Home
            </NavLink>
            <NavLink
              to='/products'
              className='block w-full text-left py-2 text-gray-700 hover:text-primary transition-colors duration-200 text-lg font-medium border-b border-gray-100'
              onClick={() => handleNavLinkClick('/products')}
            >
              Produtos
            </NavLink>
            <NavLink
              to='/contact'
              className='block w-full text-left py-2 text-gray-700 hover:text-primary transition-colors duration-200 text-lg font-medium border-b border-gray-100'
              onClick={() => handleNavLinkClick('/contact')}
            >
              Contacto
            </NavLink>

            {/* Mobile User Profile / Login / Logout */}
            {user ? (
              <>
                <NavLink
                  to='/my-orders'
                  className='block w-full text-left py-2 text-gray-700 hover:text-primary transition-colors duration-200 text-lg font-medium border-b border-gray-100'
                  onClick={() => handleNavLinkClick('/my-orders')}
                >
                  Os meus Pedidos
                </NavLink>
                <button
                  onClick={logout}
                  className='w-full cursor-pointer px-6 py-3 mt-4 bg-primary hover:bg-primary-dull transition text-white rounded-lg text-base font-semibold'
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  setShowUserLogin(true);
                }}
                className='w-full cursor-pointer px-6 py-3 mt-4 bg-primary hover:bg-primary-dull transition text-white rounded-lg text-base font-semibold'
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
